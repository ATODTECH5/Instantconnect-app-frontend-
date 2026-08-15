import type { SignInInput } from "@/features/auth/sign-in-schema";
import type { SignUpInput } from "@/features/auth/sign-up-schema";

/**
 * Stand-in for the account API. Every call resolves after a delay so the
 * loading and error states are exercisable before the backend exists; swapping
 * these bodies for real requests is the only change the screens need.
 */
const MOCK_LATENCY_MS = 1600;

export class AuthError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createAccount(input: SignUpInput): Promise<{ email: string }> {
	await delay(MOCK_LATENCY_MS);
	return { email: input.email };
}

export async function verifyEmail(code: string): Promise<void> {
	await delay(MOCK_LATENCY_MS);

	if (code === "0000") {
		throw new AuthError("That code is not correct. Check it and try again.");
	}
}

export async function resendVerificationCode(): Promise<void> {
	await delay(MOCK_LATENCY_MS);
}

/**
 * A real PIN must go to the keychain via `expo-secure-store`, never to state or
 * AsyncStorage. This mock deliberately keeps no copy of it.
 */
export async function createPin(_pin: string): Promise<void> {
	await delay(MOCK_LATENCY_MS);
}

export async function saveInterests(_interestIds: string[]): Promise<void> {
	await delay(MOCK_LATENCY_MS);
}

export async function signIn(input: SignInInput): Promise<{ email: string }> {
	await delay(MOCK_LATENCY_MS);

	if (input.password === "wrong") {
		throw new AuthError("That email and password do not match.");
	}

	return { email: input.email };
}

export async function setBiometricsEnabled(_enabled: boolean): Promise<void> {
	await delay(MOCK_LATENCY_MS / 4);
}

/**
 * Resolves whether or not the address has an account, since answering honestly
 * would turn this screen into a way to enumerate registered users.
 */
export async function requestPasswordReset(_email: string): Promise<void> {
	await delay(MOCK_LATENCY_MS);
}

export async function resendPasswordResetCode(_email: string): Promise<void> {
	await delay(MOCK_LATENCY_MS);
}

/**
 * The token stands in for what a real endpoint returns once the code checks
 * out, so the new password screen proves it came through the code step rather
 * than carrying the raw code onward.
 */
export async function verifyPasswordResetCode(code: string): Promise<{ resetToken: string }> {
	await delay(MOCK_LATENCY_MS);

	if (code === "0000") {
		throw new AuthError("That code is not correct. Check it and try again.");
	}

	return { resetToken: `reset_${code}` };
}

export async function setNewPassword(_resetToken: string, _password: string): Promise<void> {
	await delay(MOCK_LATENCY_MS);
}
