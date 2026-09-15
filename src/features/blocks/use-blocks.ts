import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import type { ApiBlockedUser } from "@/lib/api/blocks-schema";
import { blockUser, fetchBlockedUsers, unblockUser } from "./blocks-service";

export const BLOCKED_USERS_KEY = ["blocks"] as const;

export function useBlockedUsers(): UseQueryResult<ApiBlockedUser[]> {
	return useQuery({ queryKey: BLOCKED_USERS_KEY, queryFn: fetchBlockedUsers });
}

type BlockAction = { type: "block" | "unblock"; userId: string };

/**
 * A block changes who appears in discovery, the connection list and search,
 * so everything that lists people is refetched, not only the blocked list.
 * Not awaited: the person screen navigates away in its own `onSuccess`, and
 * waiting on a refetch here (which for the blocked person now 404s and
 * retries) would hold that navigation for seconds. The person query is left
 * alone for the same reason; it is gone with the screen.
 */
export function useBlockAction(): UseMutationResult<void, Error, BlockAction> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: (action) =>
			action.type === "block" ? blockUser(action.userId) : unblockUser(action.userId),
		onSettled: () => {
			void client.invalidateQueries({ queryKey: BLOCKED_USERS_KEY });
			void client.invalidateQueries({ queryKey: ["discovery", "people"] });
			void client.invalidateQueries({ queryKey: ["connections"] });
			void client.invalidateQueries({ queryKey: ["search"] });
		},
	});
}
