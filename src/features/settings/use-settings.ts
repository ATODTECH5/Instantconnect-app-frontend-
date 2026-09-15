import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import { profileKey } from "@/features/profile/use-profile";
import type { ApiNotificationPreferences } from "@/lib/api/settings-schema";
import type { ApiUser } from "@/lib/api/user-schema";
import {
	fetchNotificationPreferences,
	updateNotificationPreferences,
	updateSecurity,
} from "./settings-service";

export const NOTIFICATION_PREFERENCES_KEY = ["settings", "notifications"] as const;
export const CURRENT_USER_KEY = ["users", "me"] as const;

export function useNotificationPreferences(): UseQueryResult<ApiNotificationPreferences> {
	return useQuery({
		queryKey: NOTIFICATION_PREFERENCES_KEY,
		queryFn: fetchNotificationPreferences,
	});
}

/**
 * Optimistic: a switch that waits for the network reads as broken, so the
 * cache flips first and is put back if the server disagrees.
 */
export function useUpdateNotificationPreferences(): UseMutationResult<
	ApiNotificationPreferences,
	Error,
	Partial<ApiNotificationPreferences>,
	{ previous: ApiNotificationPreferences | undefined }
> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: updateNotificationPreferences,
		onMutate: async (changes) => {
			await client.cancelQueries({ queryKey: NOTIFICATION_PREFERENCES_KEY });

			const previous = client.getQueryData<ApiNotificationPreferences>(
				NOTIFICATION_PREFERENCES_KEY,
			);

			if (previous) {
				client.setQueryData(NOTIFICATION_PREFERENCES_KEY, { ...previous, ...changes });
			}

			return { previous };
		},
		onError: (_error, _changes, context) => {
			if (context?.previous) {
				client.setQueryData(NOTIFICATION_PREFERENCES_KEY, context.previous);
			}
		},
		onSuccess: (saved) => client.setQueryData(NOTIFICATION_PREFERENCES_KEY, saved),
	});
}

/** Same optimistic shape for the two flags on Password & Security. */
export function useUpdateSecurity(): UseMutationResult<
	ApiUser,
	Error,
	{ biometricsEnabled?: boolean; twoFactorEnabled?: boolean },
	{ previous: ApiUser | undefined }
> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: updateSecurity,
		onMutate: async (changes) => {
			await client.cancelQueries({ queryKey: CURRENT_USER_KEY });

			const previous = client.getQueryData<ApiUser>(CURRENT_USER_KEY);

			if (previous) client.setQueryData(CURRENT_USER_KEY, { ...previous, ...changes });

			return { previous };
		},
		onError: (_error, _changes, context) => {
			if (context?.previous) client.setQueryData(CURRENT_USER_KEY, context.previous);
		},
		onSuccess: (saved) => client.setQueryData(CURRENT_USER_KEY, saved),
	});
}

/** After a confirmed email or phone change, both account reads are stale. */
export function useRefreshAccount(): () => Promise<void> {
	const client = useQueryClient();

	return async () => {
		await Promise.all([
			client.invalidateQueries({ queryKey: CURRENT_USER_KEY }),
			client.invalidateQueries({ queryKey: profileKey }),
		]);
	};
}
