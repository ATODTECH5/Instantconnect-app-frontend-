import { z } from "zod";

/**
 * Deliberately looser than the sign up rules: an existing password only has to
 * be present, since rejecting it locally for a policy that changed since the
 * account was made would lock people out of their own accounts.
 */
export const signInSchema = z.object({
	email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
	password: z.string().min(1, "Enter your password"),
	keepSignedIn: z.boolean(),
});

export type SignInValues = z.input<typeof signInSchema>;
export type SignInInput = z.output<typeof signInSchema>;
