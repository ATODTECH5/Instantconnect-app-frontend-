import { z } from "zod";

/** Mirrors `InterestResponseDto` on the server. */
export const interestSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
});

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
	interests: z.array(interestSchema),
	createdAt: z.string().min(1),
});

export type ApiUser = z.infer<typeof userSchema>;
export type ApiInterest = z.infer<typeof interestSchema>;
