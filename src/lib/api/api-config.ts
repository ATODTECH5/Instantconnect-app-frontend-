import Constants from "expo-constants";

const API_PREFIX = "/api/v1";
const DEV_SERVER_PORT = 5001;

export const API_TIMEOUT_MS = 15_000;

/**
 * Refresh this far ahead of the access token's expiry so a request never leaves
 * with a token that dies in flight, and so clock drift between phone and server
 * cannot produce a 401 the client did not expect.
 */
export const TOKEN_REFRESH_SKEW_MS = 30_000;

/**
 * `localhost` resolves to the phone, not to the laptop, so a simulator, an
 * emulator, or a real device all need the LAN address instead. Metro is already
 * being served from that address, so `hostUri` gives it to us and development
 * works without a per machine .env entry.
 */
function inferDevelopmentBaseUrl(): string | null {
	const host = Constants.expoConfig?.hostUri?.split(":")[0];

	return host ? `http://${host}:${DEV_SERVER_PORT}${API_PREFIX}` : null;
}

function resolveBaseUrl(): string {
	const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

	if (configured) return configured.replace(/\/+$/, "");

	const inferred = __DEV__ ? inferDevelopmentBaseUrl() : null;

	if (inferred) return inferred;

	throw new Error(
		"EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and point it at the API.",
	);
}

let cachedBaseUrl: string | null = null;

export function getApiBaseUrl(): string {
	cachedBaseUrl ??= resolveBaseUrl();

	return cachedBaseUrl;
}
