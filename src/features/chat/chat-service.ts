import { request } from "@/lib/api/api-client";
import {
	conversationPageSchema,
	messagePageSchema,
	messageSchema,
	type ApiConversationPage,
	type ApiMessage,
	type ApiMessagePage,
} from "@/lib/api/chat-schema";

/** Mirrors MAX_MESSAGE_LENGTH on the server, which rejects anything longer. */
export const MAX_MESSAGE_LENGTH = 4000;

export type ConversationFilter = "all" | "unread" | "favourites";

export type ConversationsQuery = {
	filter?: ConversationFilter;
	limit?: number;
	offset?: number;
};

function toSearch(query: ConversationsQuery): string {
	const params = new URLSearchParams();

	if (query.filter === "unread") params.set("unreadOnly", "true");
	if (query.filter === "favourites") params.set("favouritesOnly", "true");
	if (query.limit !== undefined) params.set("limit", String(query.limit));
	if (query.offset !== undefined) params.set("offset", String(query.offset));

	const search = params.toString();

	return search ? `?${search}` : "";
}

export function fetchConversations(
	query: ConversationsQuery = {},
): Promise<ApiConversationPage> {
	return request(`/conversations${toSearch(query)}`, {
		schema: conversationPageSchema,
		auth: true,
	});
}

export function fetchMessages(
	conversationId: string,
	query: { limit?: number; offset?: number } = {},
): Promise<ApiMessagePage> {
	const params = new URLSearchParams();

	if (query.limit !== undefined) params.set("limit", String(query.limit));
	if (query.offset !== undefined) params.set("offset", String(query.offset));

	const search = params.toString();

	return request(`/conversations/${conversationId}/messages${search ? `?${search}` : ""}`, {
		schema: messagePageSchema,
		auth: true,
	});
}

export function sendMessage(conversationId: string, body: string): Promise<ApiMessage> {
	return request(`/conversations/${conversationId}/messages`, {
		method: "POST",
		body: { body },
		schema: messageSchema,
		auth: true,
	});
}

export function markThreadRead(conversationId: string): Promise<void> {
	return request(`/conversations/${conversationId}/read`, {
		method: "PATCH",
		auth: true,
	});
}
