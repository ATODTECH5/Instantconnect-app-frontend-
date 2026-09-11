import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import {
	fetchConversations,
	type ConversationFilter,
} from "@/features/chat/chat-service";
import type { ApiConversationPage } from "@/lib/api/chat-schema";

export const CONVERSATIONS_KEY = ["conversations"] as const;

/**
 * Each chip is its own cache entry rather than one list filtered on the client.
 * Unread and Favourites are server side filters over the whole set, so a client
 * side filter of the first page would silently hide matches further down it.
 */
export function useConversations(
	filter: ConversationFilter,
): UseQueryResult<ApiConversationPage> {
	return useQuery({
		queryKey: [...CONVERSATIONS_KEY, filter],
		queryFn: () => fetchConversations({ filter }),
	});
}
