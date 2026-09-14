import { z } from "zod";

export const meetupStatusSchema = z.enum([
	"proposed",
	"scheduled",
	"active",
	"ended",
	"declined",
	"cancelled",
	"expired",
]);

export const arrivalStateSchema = z.enum(["pending", "en_route", "arrived"]);

const meetupPartySchema = z.object({
	userId: z.string(),
	arrivalState: arrivalStateSchema,
	arrivedAt: z.string().nullable(),
	isVerified: z.boolean(),
});

const meetupVenueSchema = z.object({
	name: z.string(),
	address: z.string().nullable(),
	latitude: z.number().nullable(),
	longitude: z.number().nullable(),
});

/**
 * Viewer-relative: `isAwaitingMe`, `me` and `party` are already worked out
 * for whoever asked, so a card never reasons about roles.
 */
export const meetupSchema = z.object({
	id: z.string(),
	conversationId: z.string(),
	status: meetupStatusSchema,
	proposedTimes: z.array(z.string()),
	scheduledAt: z.string().nullable(),
	venue: meetupVenueSchema.nullable(),
	isProposer: z.boolean(),
	isAwaitingMe: z.boolean(),
	me: meetupPartySchema,
	party: meetupPartySchema,
	createdAt: z.string(),
	endedAt: z.string().nullable(),
});

/** Null is a normal answer, so it travels inside an object. */
export const openMeetupSchema = z.object({ meetup: meetupSchema.nullable() });

export type ApiMeetup = z.infer<typeof meetupSchema>;
export type MeetupStatus = z.infer<typeof meetupStatusSchema>;
