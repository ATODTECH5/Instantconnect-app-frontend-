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

export const meetupPartySchema = z.object({
	userId: z.string(),
	arrivalState: arrivalStateSchema,
	arrivedAt: z.string().nullable(),
	isVerified: z.boolean(),
	/** Null until a code is issued, and again once it is consumed or expired. */
	codeExpiresAt: z.string().nullable(),
	isSharingLocation: z.boolean(),
	/** Null unless sharing is on and a fix has been reported. */
	location: z.object({ latitude: z.number(), longitude: z.number() }).nullable(),
	locationAt: z.string().nullable(),
	distanceToVenueM: z.number().nullable(),
	isInSafeZone: z.boolean().nullable(),
});

export type ApiMeetupParty = z.infer<typeof meetupPartySchema>;

export const meetupLocationEventSchema = z.object({
	meetupId: z.string(),
	party: meetupPartySchema,
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
	safeZoneRadiusM: z.number(),
	createdAt: z.string(),
	endedAt: z.string().nullable(),
});

/** Null is a normal answer, so it travels inside an object. */
export const openMeetupSchema = z.object({ meetup: meetupSchema.nullable() });

export const arrivalCodeSchema = z.object({
	code: z.string(),
	expiresAt: z.string(),
	meetup: meetupSchema,
});

export const verifyCodeSchema = z.object({
	verified: z.boolean(),
	attemptsLeft: z.number(),
	meetup: meetupSchema,
});

export type ApiMeetup = z.infer<typeof meetupSchema>;
export type ApiArrivalCode = z.infer<typeof arrivalCodeSchema>;
export type ApiVerifyCode = z.infer<typeof verifyCodeSchema>;
export type MeetupStatus = z.infer<typeof meetupStatusSchema>;
