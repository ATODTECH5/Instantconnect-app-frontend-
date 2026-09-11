import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import { request } from "@/lib/api/api-client";
import { uploadToProvider } from "@/lib/api/direct-upload";
import {
	lookupSchema,
	profileSchema,
	type ApiLookup,
	type ApiProfile,
} from "@/lib/api/profile-schema";
import { uploadSignatureSchema } from "@/lib/api/upload-signature-schema";
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

	await uploadToProvider(signature, photo);

	return request(`/users/me/photos/${position}`, {
		method: "PUT",
		body: { storageId: signature.storageId },
		schema: profileSchema,
		auth: true,
	});
}
