import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";

import {
	fetchHobbies,
	fetchOccupations,
	fetchProfile,
	removePhoto,
	updateProfile,
	uploadPhoto,
	type ProfileChanges,
} from "@/features/profile/profile-service";
import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import type { ApiLookup, ApiProfile } from "@/lib/api/profile-schema";

export const profileKey = ["users", "me", "profile"] as const;

/** Seeded lists change about never, so they are cached for the session. */
const REFERENCE_STALE_MS = 60 * 60 * 1000;

export function useProfile(): UseQueryResult<ApiProfile> {
	return useQuery({ queryKey: profileKey, queryFn: fetchProfile });
}

export function useOccupations(): UseQueryResult<ApiLookup[]> {
	return useQuery({
		queryKey: ["reference", "occupations"],
		queryFn: fetchOccupations,
		staleTime: REFERENCE_STALE_MS,
	});
}

export function useHobbies(): UseQueryResult<ApiLookup[]> {
	return useQuery({
		queryKey: ["reference", "hobbies"],
		queryFn: fetchHobbies,
		staleTime: REFERENCE_STALE_MS,
	});
}

/**
 * Every profile write returns the whole profile, so the cache is replaced with
 * the server's answer rather than being invalidated and refetched.
 */
export function useUpdateProfile(): UseMutationResult<ApiProfile, Error, ProfileChanges> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: updateProfile,
		onSuccess: (profile) => {
			client.setQueryData(profileKey, profile);
			// The header greeting and the tab avatar read the account, not the
			// profile, and the name can change here.
			void client.invalidateQueries({ queryKey: ["users", "me"] });
		},
	});
}

export type PhotoUpload = { position: number; photo: PickedPhoto };

export function useUploadPhoto(): UseMutationResult<ApiProfile, Error, PhotoUpload> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: ({ position, photo }: PhotoUpload) => uploadPhoto(position, photo),
		onSuccess: (profile) => client.setQueryData(profileKey, profile),
	});
}

export function useRemovePhoto(): UseMutationResult<void, Error, number> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: removePhoto,
		onSuccess: () => client.invalidateQueries({ queryKey: profileKey }),
	});
}
