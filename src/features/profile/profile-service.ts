import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import { request } from "@/lib/api/api-client";
import { uploadRejectedError, uploadTransportError } from "@/lib/api/api-error";
import {
	lookupSchema,
	profileSchema,
	uploadSignatureSchema,
	type ApiLookup,
	type ApiProfile,
} from "@/lib/api/profile-schema";
import { z } from "zod";

const lookupListSchema = z.array(lookupSchema);

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
		read.onerror = () => reject(new Error("the photo could not be read from this device"));
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

export type ProfileChanges = {
	fullName?: string;
	username?: string | null;
	bio?: string | null;
	categoryId?: string;
	occupationId?: string | null;
	locationLabel?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	hobbyIds?: string[];
};

export function fetchProfile(): Promise<ApiProfile> {
	return request("/users/me/profile", { schema: profileSchema, auth: true });
}

/** Only the keys present are changed; null clears a field, absent leaves it alone. */
export function updateProfile(changes: ProfileChanges): Promise<ApiProfile> {
	return request("/users/me/profile", {
		method: "PATCH",
		body: changes,
		schema: profileSchema,
		auth: true,
	});
}

export function fetchOccupations(): Promise<ApiLookup[]> {
	return request("/reference/occupations", { schema: lookupListSchema });
}

export function fetchHobbies(): Promise<ApiLookup[]> {
	return request("/reference/hobbies", { schema: lookupListSchema });
}

export function removePhoto(position: number): Promise<void> {
	return request(`/users/me/photos/${position}`, { method: "DELETE", auth: true });
}

/**
 * Two steps by design: the file goes straight from the device to the storage
 * provider so a photo never travels through our API, and only the confirmation
 * touches it. The confirmation carries no URL, so the address a slot ends up
 * pointing at is always the provider's, never the caller's.
 */
export async function uploadPhoto(
	position: number,
	photo: PickedPhoto,
): Promise<ApiProfile> {
	const signature = await request(`/users/me/photos/${position}/upload-signature`, {
		method: "POST",
		schema: uploadSignatureSchema,
		auth: true,
	});

	let file: Blob;

	try {
		file = await readFileAsBlob(photo.uri);
	} catch (cause) {
		throw uploadTransportError(cause instanceof Error ? cause.message : null);
	}

	const form = new FormData();

	// `slice` is a view onto the same bytes rather than a copy, and is the only
	// way to stamp the picker's declared type onto the part: the multipart
	// content-type header is read from the blob, not from the append call.
	form.append("file", file.slice(0, file.size, photo.mimeType), photo.fileName);
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

	return request(`/users/me/photos/${position}`, {
		method: "PUT",
		body: { storageId: signature.storageId },
		schema: profileSchema,
		auth: true,
	});
}
