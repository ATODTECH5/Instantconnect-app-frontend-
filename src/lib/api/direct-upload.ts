import { uploadRejectedError, uploadTransportError } from "@/lib/api/api-error";
import type { ApiUploadSignature } from "@/lib/api/upload-signature-schema";

/**
 * A file chosen on the device, ready to be handed to the storage provider.
 * Shared by profile photos and chat images, which pick the same way.
 */
export type PickedFile = {
	uri: string;
	/** Declared to the upload rather than assumed, since editing can yield PNG or HEIC. */
	mimeType: string;
	fileName: string;
};

/**
 * Expo replaces React Native's `fetch` with its own WinterCG implementation,
 * which assembles multipart bodies in JavaScript from `Blob`s. React Native's
 * proprietary `{ uri, name, type }` part is not one of the forms it can read,
 * so appending the picker's uri directly throws "Unsupported FormDataPart
 * implementation" before a socket is ever opened. Reading the file into a blob
 * here is what keeps the upload on the standard path.
 *
 * `XMLHttpRequest` is still React Native's own, and is what can resolve a
 * `file://` uri; it is deliberately not `fetch`, which no longer can.
 */
function readFileAsBlob(uri: string): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const read = new XMLHttpRequest();

		read.onload = () => resolve(read.response as Blob);
		read.onerror = () => reject(new Error("the file could not be read from this device"));
		read.responseType = "blob";
		read.open("GET", uri);
		read.send();
	});
}

/**
 * Cloudinary reports a refusal as `{ error: { message } }`. The body is read
 * defensively because a proxy or a gateway can answer in its place with
 * anything at all, and a failure to parse must not mask the refusal itself.
 */
async function readProviderError(response: Response): Promise<string | null> {
	try {
		const body = (await response.json()) as { error?: { message?: unknown } };
		const message = body.error?.message;

		return typeof message === "string" && message ? message : null;
	} catch {
		return null;
	}
}

/**
 * The device-to-provider leg, which never touches our API. Returns the
 * storageId the caller then confirms, so the address a row ends up pointing at
 * is always the provider's rather than anything the client supplied.
 */
export async function uploadToProvider(
	signature: ApiUploadSignature,
	file: PickedFile,
): Promise<string> {
	let blob: Blob;

	try {
		blob = await readFileAsBlob(file.uri);
	} catch (cause) {
		throw uploadTransportError(cause instanceof Error ? cause.message : null);
	}

	const form = new FormData();

	// `slice` is a view onto the same bytes rather than a copy, and is the only
	// way to stamp the picker's declared type onto the part: the multipart
	// content-type header is read from the blob, not from the append call.
	form.append("file", blob.slice(0, blob.size, file.mimeType), file.fileName);
	form.append("api_key", signature.apiKey);
	form.append("timestamp", String(signature.timestamp));
	form.append("public_id", signature.storageId);
	form.append("transformation", signature.transformation);
	form.append("signature", signature.signature);

	// The provider is reached directly rather than through `request`, so the two
	// ways this leg fails have to be told apart here: a refusal that came back
	// with a reason, and a send that never produced a response at all. Collapsing
	// them into one opaque failure is what makes a broken upload unattributable.
	let response: Response;

	try {
		response = await fetch(signature.uploadUrl, { method: "POST", body: form });
	} catch (cause) {
		throw uploadTransportError(cause instanceof Error ? cause.message : null);
	}

	if (!response.ok) {
		throw uploadRejectedError(response.status, await readProviderError(response));
	}

	return signature.storageId;
}
