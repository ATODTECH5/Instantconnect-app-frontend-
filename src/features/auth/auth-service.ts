import { z } from "zod";

import type { SignInInput } from "@/features/auth/sign-in-schema";
import { toE164, type SignUpInput } from "@/features/auth/sign-up-schema";
import { request } from "@/lib/api/api-client";
import { resetTokenSchema, sessionSchema } from "@/lib/api/session-schema";
import { getRefreshToken, setSession, toSession } from "@/lib/api/session-store";

/** Mirrors `RegistrationResponseDto` on the server. */
const registrationSchema = z.object({ email: z.string().min(1) });

/**
 * The body is spelled out field by field rather than spread from the form,
 * because the server validates with `forbidNonWhitelisted` and rejects the whole
 * request if the draft ever grows a key the DTO does not declare.
 */
export async function createAccount(input: SignUpInput): Promise<{ email: string }> {
	return request("/auth/register", {
		method: "POST",
		body: {
			fullName: input.fullName,
			email: input.email,
			phone: toE164(input.phone),
			password: input.password,
			termsAccepted: input.termsAccepted,
		},
		schema: registrationSchema,
	});
}

/**
 * Verification is what issues the account's first session, so the tokens are
 * stored here rather than returned. Every caller of `request` with `auth` set
 * reads the same store, so the screens after this one are authenticated without
 * passing anything along.
 */
export async function verifyEmail(email: string, code: string): Promise<void> {
	const session = await request("/auth/verify-email", {
		method: "POST",
		body: { email, code },
		schema: sessionSchema,
	});

	await setSession(toSession(session));
}

export async function resendVerificationCode(email: string): Promise<void> {
	await request("/auth/resend-verification", { method: "POST", body: { email } });
}

/**
 * A PIN is a device unlock, not a credential the account has, so it stays on the
 * phone. The keychain write lands with the `expo-secure-store` rebuild; until
 * then nothing is kept, and `pinEnabled` is deliberately not reported to the
 * server, since a flag saying a PIN exists when the device has none is worse
 * than no flag at all.
 */
export async function createPin(_pin: string): Promise<void> {}

export async function saveCategory(categoryId: string): Promise<void> {
	await request("/users/me/category", { method: "PUT", body: { categoryId }, auth: true });
}

export async function signIn(input: SignInInput): Promise<void> {
	const session = await request("/auth/sign-in", {
		method: "POST",
		body: {
			email: input.email,
			password: input.password,
			keepSignedIn: input.keepSignedIn,
		},
		schema: sessionSchema,
	});

	await setSession(toSession(session));
}

/**
 * Revokes the refresh token server side. Returns quietly when there is nothing
 * to revoke, and the server answers 204 for a token that is already gone, so the
 * local sign out that follows is never blocked by this.
 */
export async function revokeRefreshToken(): Promise<void> {
	const refreshToken = getRefreshToken();

	if (!refreshToken) return;

	await request("/auth/sign-out", { method: "POST", body: { refreshToken } });
}

/** The biometric secret is the OS's, so only the fact of enrolment is recorded. */
export async function setBiometricsEnabled(enabled: boolean): Promise<void> {
	await request("/users/me/security", {
		method: "PATCH",
		body: { biometricsEnabled: enabled },
		auth: true,
	});
}

/**
 * Resolves whether or not the address has an account, because the server answers
 * the same either way: a truthful answer would turn this into a way to enumerate
 * registered users.
 */
export async function requestPasswordReset(email: string): Promise<void> {
	await request("/auth/forgot-password", { method: "POST", body: { email } });
}

/** Issuing a new code retires the previous one, so a resend is the same call. */
export async function resendPasswordResetCode(email: string): Promise<void> {
	await requestPasswordReset(email);
}

/**
 * The grant proves the code step was cleared, so the raw code never travels on
 * to the new password screen.
 */
export async function verifyPasswordResetCode(
	email: string,
	code: string,
): Promise<{ resetToken: string }> {
	return request("/auth/verify-reset-code", {
		method: "POST",
		body: { email, code },
		schema: resetTokenSchema,
	});
}

export async function setNewPassword(resetToken: string, password: string): Promise<void> {
	await request("/auth/reset-password", { method: "POST", body: { resetToken, password } });
}
