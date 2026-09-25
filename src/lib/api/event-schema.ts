import { z } from "zod";

import { pageInfoSchema } from "@/lib/api/discovery-schema";

export const eventPersonSchema = z.object({
	id: z.string(),
	fullName: z.string(),
	avatarUrl: z.string().nullable(),
	isVerified: z.boolean(),
});

export const eventVenueSchema = z.object({
	name: z.string(),
	address: z.string().nullable(),
	latitude: z.number(),
	longitude: z.number(),
});

export const eventSummarySchema = z.object({
	id: z.string(),
	title: z.string(),
	startsAt: z.string(),
	endsAt: z.string().nullable(),
	venue: eventVenueSchema,
	category: z.object({ id: z.string(), label: z.string() }).nullable(),
	/** Kobo. Zero is a free event. */
	priceMinor: z.number(),
	isPublic: z.boolean(),
	coverUrl: z.string().nullable(),
	inviteeCount: z.number(),
	inviteePreview: z.array(eventPersonSchema),
});

export const eventPageSchema = z.object({
	items: z.array(eventSummarySchema),
	page: pageInfoSchema,
});

export const eventDetailSchema = eventSummarySchema.extend({
	description: z.string().nullable(),
	host: eventPersonSchema,
	isHost: z.boolean(),
	invitees: z.array(eventPersonSchema),
	createdAt: z.string(),
});

export const recentVenuesSchema = z.array(eventVenueSchema);

export type ApiEventPerson = z.infer<typeof eventPersonSchema>;
export type ApiEventVenue = z.infer<typeof eventVenueSchema>;
export type ApiEventSummary = z.infer<typeof eventSummarySchema>;
export type ApiEventPage = z.infer<typeof eventPageSchema>;
export type ApiEventDetail = z.infer<typeof eventDetailSchema>;
