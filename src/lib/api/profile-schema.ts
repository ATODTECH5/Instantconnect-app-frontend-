import { z } from "zod";

/** Mirrors `LookupResponseDto` on the server: categories, occupations and hobbies. */
export const lookupSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
});

export const profilePhotoSchema = z.object({
	id: z.string().min(1),
	/** 0 is the avatar, 1 to 3 are the gallery slots. */
	position: z.number().int().min(0).max(3),
	thumbnailUrl: z.string().min(1),
	url: z.string().min(1),
});

export const profileStatsSchema = z.object({
	connections: z.number().int().min(0),
	eventsJoined: z.number().int().min(0),
	communities: z.number().int().min(0),
});

/**
 * Mirrors `ProfileResponseDto`. The enum is kept rather than loosened to a
 * string so a status the app has no branch for is caught here.
 */
export const profileSchema = z.object({
	id: z.string().min(1),
	fullName: z.string().min(1),
	username: z.string().nullable(),
	bio: z.string().nullable(),
	category: lookupSchema.nullable(),
	occupation: lookupSchema.nullable(),
	locationLabel: z.string().nullable(),
	hobbies: z.array(lookupSchema),
	avatarUrl: z.string().nullable(),
	photos: z.array(profilePhotoSchema),
	kycStatus: z.enum(["none", "pending", "verified", "rejected"]),
	isVerified: z.boolean(),
	stats: profileStatsSchema,
});

export const uploadSignatureSchema = z.object({
	uploadUrl: z.string().min(1),
	apiKey: z.string().min(1),
	timestamp: z.number(),
	signature: z.string().min(1),
	storageId: z.string().min(1),
	transformation: z.string().min(1),
});

export type ApiLookup = z.infer<typeof lookupSchema>;
export type ApiProfile = z.infer<typeof profileSchema>;
export type ApiProfilePhoto = z.infer<typeof profilePhotoSchema>;
export type ApiUploadSignature = z.infer<typeof uploadSignatureSchema>;
export type KycStatus = ApiProfile["kycStatus"];
