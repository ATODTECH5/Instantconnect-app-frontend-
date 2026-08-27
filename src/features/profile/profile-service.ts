import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import { request } from "@/lib/api/api-client";
import {
	lookupSchema,
	profileSchema,
	uploadSignatureSchema,
	type ApiLookup,
	type ApiProfile,
} from "@/lib/api/profile-schema";
import { z } from "zod";

const lookupListSchema = z.array(lookupSchema);

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

	const form = new FormData();

	form.append("file", {
		uri: photo.uri,
		name: photo.fileName,
		type: photo.mimeType,
	} as unknown as Blob);
	form.append("api_key", signature.apiKey);
	form.append("timestamp", String(signature.timestamp));
	form.append("public_id", signature.storageId);
	form.append("transformation", signature.transformation);
	form.append("signature", signature.signature);

	const response = await fetch(signature.uploadUrl, { method: "POST", body: form });

	if (!response.ok) {
		throw new Error(`Upload failed with status ${response.status}`);
	}

	return request(`/users/me/photos/${position}`, {
		method: "PUT",
		body: { storageId: signature.storageId },
		schema: profileSchema,
		auth: true,
	});
}
