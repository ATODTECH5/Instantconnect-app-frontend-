import { z } from "zod";

import { lookupSchema } from "@/lib/api/profile-schema";

/**
 * Mirrors `UserResponseDto` on the server, including its enums rather than
 * loosening them to strings, so a value the app has no branch for is caught
 * here instead of surfacing as a silently wrong state further in.
 */
export const userSchema = z.object({
	id: z.string().min(1),
	fullName: z.string().min(1),
	firstName: z.string().min(1),
	email: z.string().min(1),
	phone: z.string().min(1),
	role: z.enum(["user", "admin"]),
	status: z.enum(["pending_verification", "active", "suspended"]),
	isEmailVerified: z.boolean(),
	pinEnabled: z.boolean(),
	biometricsEnabled: z.boolean(),
	/** What the account is here for. Null until onboarding sets it. */
	category: lookupSchema.nullable(),
	createdAt: z.string().min(1),
});

export type ApiUser = z.infer<typeof userSchema>;
