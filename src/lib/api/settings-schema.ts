import { z } from "zod";

/** Mirrors `NotificationPreferencesResponseDto` on the server. */
export const notificationPreferencesSchema = z.object({
	pushEnabled: z.boolean(),
	pushEventReminders: z.boolean(),
	pushNewConnections: z.boolean(),
	pushMessages: z.boolean(),
	pushCommunityUpdates: z.boolean(),
	emailEnabled: z.boolean(),
	emailEventInvites: z.boolean(),
	emailWeeklyDigest: z.boolean(),
	emailPromotions: z.boolean(),
	inAppEnabled: z.boolean(),
});

export type ApiNotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

export type NotificationPreferenceKey = keyof ApiNotificationPreferences;

export const codeSentSchema = z.object({
	sentTo: z.string().min(1),
});

export type ApiCodeSent = z.infer<typeof codeSentSchema>;

/** The reason sheet on the Delete Account frame, in its order. Values match the server. */
export const DELETION_REASONS = [
	{ id: "not_aligned", label: "The app does not align with my need" },
	{ id: "expensive", label: "Subscription plans are expensive" },
	{ id: "few_matches", label: "I hardly match with people in my area" },
	{ id: "security", label: "The app security is bad" },
	{ id: "poor_ui", label: "Poor UI" },
	{ id: "slow", label: "App is slow" },
	{ id: "other", label: "Other" },
] as const;

export type DeletionReason = (typeof DELETION_REASONS)[number]["id"];
