import { z } from "zod";

import { lookupSchema } from "@/lib/api/profile-schema";

/** Where the viewer stands with one other person, as the server reports it. */
export const connectionStateSchema = z.enum([
	"none",
	"outgoing_pending",
	"incoming_pending",
	"connected",
	"declined",
]);

export const pageInfoSchema = z.object({
	total: z.number(),
	limit: z.number(),
	offset: z.number(),
});

export const nearbyPersonSchema = z.object({
	id: z.string(),
	fullName: z.string(),
	/** Null for accounts created before date of birth was captured. */
	age: z.number().nullable(),
	category: lookupSchema.nullable(),
	occupation: lookupSchema.nullable(),
	avatarUrl: z.string().nullable(),
	distanceKm: z.number(),
	isVerified: z.boolean(),
	isOnline: z.boolean(),
	connectionState: connectionStateSchema,
});

export const discoveryPageSchema = z.object({
	items: z.array(nearbyPersonSchema),
	page: pageInfoSchema,
});

export const personProfileSchema = z.object({
	id: z.string(),
	fullName: z.string(),
	age: z.number().nullable(),
	bio: z.string().nullable(),
	category: lookupSchema.nullable(),
	occupation: lookupSchema.nullable(),
	hobbies: z.array(lookupSchema),
	locationLabel: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	photoUrls: z.array(z.string()),
	distanceKm: z.number(),
	isVerified: z.boolean(),
	isOnline: z.boolean(),
	connectionState: connectionStateSchema,
});

export const connectionPartySchema = z.object({
	id: z.string(),
	fullName: z.string(),
	avatarUrl: z.string().nullable(),
	locationLabel: z.string().nullable(),
	isVerified: z.boolean(),
});

export const connectionSchema = z.object({
	id: z.string(),
	status: z.enum(["pending", "accepted", "declined"]),
	isOutgoing: z.boolean(),
	party: connectionPartySchema,
	createdAt: z.string(),
	respondedAt: z.string().nullable(),
});

export const connectionPageSchema = z.object({
	items: z.array(connectionSchema),
	page: pageInfoSchema,
});

export type ConnectionState = z.infer<typeof connectionStateSchema>;
export type ApiNearbyPerson = z.infer<typeof nearbyPersonSchema>;
export type ApiDiscoveryPage = z.infer<typeof discoveryPageSchema>;
export type ApiPersonProfile = z.infer<typeof personProfileSchema>;
export type ApiConnection = z.infer<typeof connectionSchema>;
export type ApiConnectionPage = z.infer<typeof connectionPageSchema>;
