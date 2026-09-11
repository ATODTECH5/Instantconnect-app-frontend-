import { z } from "zod";

import { pageInfoSchema } from "@/lib/api/discovery-schema";

export const notificationKindSchema = z.enum([
	"message",
	"connection_request",
	"connection_accepted",
]);

export const notificationActorSchema = z.object({
	id: z.string(),
	fullName: z.string(),
	avatarUrl: z.string().nullable(),
});

/**
 * Title and body are written by the server rather than the client, so the
 * wording of a notification cannot drift between the two.
 */
export const notificationSchema = z.object({
	id: z.string(),
	kind: notificationKindSchema,
	title: z.string(),
	body: z.string(),
	actor: notificationActorSchema.nullable(),
	subjectId: z.string().nullable(),
	isRead: z.boolean(),
	createdAt: z.string(),
});

export const notificationPageSchema = z.object({
	items: z.array(notificationSchema),
	page: pageInfoSchema,
	unreadCount: z.number(),
});

export type ApiNotificationKind = z.infer<typeof notificationKindSchema>;
export type ApiNotification = z.infer<typeof notificationSchema>;
export type ApiNotificationPage = z.infer<typeof notificationPageSchema>;
