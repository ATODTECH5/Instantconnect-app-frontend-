import { z } from "zod";

import { pageInfoSchema } from "@/lib/api/discovery-schema";

export const conversationPartySchema = z.object({
	id: z.string(),
	fullName: z.string(),
	avatarUrl: z.string().nullable(),
	isVerified: z.boolean(),
	isOnline: z.boolean(),
});

/** The last message as one line, whatever kind it was. */
export const conversationPreviewSchema = z.object({
	text: z.string(),
	isMine: z.boolean(),
	createdAt: z.string(),
});

export const conversationSchema = z.object({
	/** Also the connection id: there is one thread per accepted pair. */
	id: z.string(),
	party: conversationPartySchema,
	lastMessage: conversationPreviewSchema.nullable(),
	unreadCount: z.number(),
	isFavourite: z.boolean(),
	lastMessageAt: z.string().nullable(),
	/** How far the other party has read, which is what makes a tick honest. */
	partyLastReadAt: z.string().nullable(),
});

export const conversationPageSchema = z.object({
	items: z.array(conversationSchema),
	page: pageInfoSchema,
	/** Threads with anything unread, for the tab badge and the Unread chip. */
	unreadThreads: z.number(),
});

export type ApiConversation = z.infer<typeof conversationSchema>;
export type ApiConversationPage = z.infer<typeof conversationPageSchema>;

export const messageKindSchema = z.enum(["text", "image", "system", "meetup"]);

export const messageSchema = z.object({
	id: z.string(),
	kind: messageKindSchema,
	body: z.string().nullable(),
	mediaUrl: z.string().nullable(),
	/** Decides which side of the thread the bubble sits on. */
	isMine: z.boolean(),
	createdAt: z.string(),
});

export const messagePageSchema = z.object({
	items: z.array(messageSchema),
	page: pageInfoSchema,
	partyLastReadAt: z.string().nullable(),
});

export const readReceiptSchema = z.object({
	id: z.string(),
	lastReadAt: z.string(),
});

export type ApiMessage = z.infer<typeof messageSchema>;
export type ApiMessagePage = z.infer<typeof messagePageSchema>;
