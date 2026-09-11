import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";

import {
	fetchMessages,
	markThreadRead,
	sendImageMessage,
	sendMessage,
} from "@/features/chat/chat-service";
import {
	CONVERSATIONS_KEY,
	useConversations,
} from "@/features/chat/use-conversations";
import type { PickedFile } from "@/lib/api/direct-upload";
import type { ApiConversation, ApiMessagePage } from "@/lib/api/chat-schema";

export const MESSAGES_KEY = ["messages"] as const;

export function useMessages(conversationId: string): UseQueryResult<ApiMessagePage> {
	return useQuery({
		queryKey: [...MESSAGES_KEY, conversationId],
		queryFn: () => fetchMessages(conversationId),
	});
}

/**
 * The header needs the other party, which only the list endpoint reports.
 *
 * Reading the list's cache alone is not enough: it is empty whenever the thread
 * was not reached through the list, which includes a deep link and any reload
 * that lands straight on this route, and the header then degrades to a nameless
 * "Conversation". Sharing the list query instead means a warm cache answers
 * instantly and a cold one fetches once.
 *
 * Still bounded by the first page. A thread further down the list resolves to
 * undefined, and the real fix for that is a `GET /conversations/:id`.
 */
export function useConversationSummary(
	conversationId: string,
): ApiConversation | undefined {
	const conversations = useConversations("all");

	return conversations.data?.items.find((item) => item.id === conversationId);
}

type Outgoing = { kind: "text"; body: string } | { kind: "image"; image: PickedFile };

/**
 * Text and images share one mutation so the thread has a single sending and
 * failure state. An image takes noticeably longer, since it uploads to the
 * provider before the message is created, and the composer stays disabled for
 * the whole of it rather than only the last leg.
 */
export function useSendMessage(conversationId: string) {
	const client = useQueryClient();

	const mutation = useMutation({
		mutationFn: (outgoing: Outgoing) =>
			outgoing.kind === "text"
				? sendMessage(conversationId, outgoing.body)
				: sendImageMessage(conversationId, outgoing.image),
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: [...MESSAGES_KEY, conversationId] });
			// The list orders by last message and previews it, so both move.
			void client.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
		},
	});

	return {
		send: (body: string) => mutation.mutate({ kind: "text", body }),
		sendImage: (image: PickedFile) => mutation.mutate({ kind: "image", image }),
		isSending: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
	};
}

/**
 * Opening a thread is what marks it read, matching the badge the user just
 * tapped. Runs once per thread rather than on every render of it.
 */
export function useMarkReadOnOpen(conversationId: string, enabled: boolean): void {
	const client = useQueryClient();

	useEffect(() => {
		if (!enabled) return;

		let cancelled = false;

		markThreadRead(conversationId)
			.then(() => {
				if (!cancelled) {
					void client.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
				}
			})
			// A failed read receipt is not worth interrupting the thread for.
			.catch(() => {});

		return () => {
			cancelled = true;
		};
	}, [conversationId, enabled, client]);
}
