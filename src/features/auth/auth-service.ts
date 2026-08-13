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
