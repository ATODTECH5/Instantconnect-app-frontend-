import { z } from "zod";

import { userSchema } from "@/lib/api/user-schema";

/** Mirrors `TokenPairResponseDto` on the server. */
export const issuedTokensSchema = z.object({
	accessToken: z.string().min(1),
	refreshToken: z.string().min(1),
	accessTokenExpiresIn: z.number().positive(),
	refreshTokenExpiresAt: z.string().min(1),
});

/**
 * Mirrors `SessionResponseDto`, which is the token pair plus the account it
 * belongs to. Sign in and email verification both answer with it, so the app
 * never needs a second round trip to learn who just signed in.
 */
export const sessionSchema = issuedTokensSchema.extend({ user: userSchema });

/** Mirrors `ResetTokenResponseDto` on the server. */
export const resetTokenSchema = z.object({ resetToken: z.string().min(1) });
