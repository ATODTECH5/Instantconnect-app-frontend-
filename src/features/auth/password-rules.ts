import { z } from "zod";

/**
 * One definition for every screen that sets a password, so sign up and password
 * reset can never drift into accepting different things.
 */
export const passwordSchema = z
	.string()
	.min(8, "Use at least 8 characters")
	.max(72, "Password is too long")
	.regex(/[a-z]/, "Include a lowercase letter")
	.regex(/[A-Z]/, "Include an uppercase letter")
	.regex(/\d/, "Include a number");
