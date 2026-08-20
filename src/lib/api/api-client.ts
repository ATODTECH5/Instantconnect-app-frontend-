import type { ZodType } from "zod";

import { API_TIMEOUT_MS, getApiBaseUrl } from "@/lib/api/api-config";
import {
	ApiError,
	errorFromResponse,
	isApiError,
	malformedResponseError,
	networkError,
	timeoutError,
} from "@/lib/api/api-error";
import { issuedTokensSchema } from "@/lib/api/session-schema";
import {
	clearSession,
	getAccessToken,
	getRefreshToken,
	hasFreshAccessToken,
	readRestorableRefreshToken,
	setSession,
	toSession,
	type AuthSession,
} from "@/lib/api/session-store";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type RequestOptions<T> = {
	method?: HttpMethod;
	body?: unknown;
	/** Validates the response before it reaches a screen. Omit only for 204 endpoints. */
	schema?: ZodType<T>;
	/** Sends the bearer token, refreshing it first when it is expired or close to it. */
	auth?: boolean;
	signal?: AbortSignal;
	timeoutMs?: number;
};

function unauthenticated(): ApiError {
	return new ApiError({
		code: "UNAUTHENTICATED",
		message: "Your session has ended. Sign in to continue.",
		status: 401,
	});
}

async function readBody(response: Response): Promise<unknown> {
	if (response.status === 204) return null;

	const text = await response.text();

	if (!text) return null;

	try {
		return JSON.parse(text) as unknown;
	} catch {
		return null;
	}
}

async function send<T>(
	path: string,
	options: RequestOptions<T>,
	accessToken: string | null,
): Promise<T> {
	const controller = new AbortController();
	const external = options.signal;
	const abortExternally = () => controller.abort();
	let timedOut = false;

	const timer = setTimeout(() => {
		timedOut = true;
		controller.abort();
	}, options.timeoutMs ?? API_TIMEOUT_MS);

	external?.addEventListener("abort", abortExternally);

	const headers: Record<string, string> = { Accept: "application/json" };

	if (options.body !== undefined) headers["Content-Type"] = "application/json";
	if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

	try {
		const response = await fetch(`${getApiBaseUrl()}${path}`, {
			method: options.method ?? "GET",
			headers,
			body: options.body === undefined ? undefined : JSON.stringify(options.body),
			signal: controller.signal,
		});

		const body = await readBody(response);

		if (!response.ok) throw errorFromResponse(response.status, body);

		if (!options.schema) return undefined as unknown as T;

		const parsed = options.schema.safeParse(body);

		if (!parsed.success) throw malformedResponseError();

		return parsed.data;
	} catch (cause) {
		if (isApiError(cause)) throw cause;
		if (timedOut) throw timeoutError();
		// A caller that aborted (an unmounted screen, a superseded query) has to see
		// the abort itself, since a query counts that as a cancellation rather than
		// as a failure worth retrying or reporting.
		if (external?.aborted) throw cause;

		throw networkError();
	} finally {
		clearTimeout(timer);
		external?.removeEventListener("abort", abortExternally);
	}
}

let refreshInFlight: Promise<AuthSession> | null = null;

async function rotateTokens(): Promise<AuthSession> {
	const refreshToken = getRefreshToken() ?? (await readRestorableRefreshToken());

	if (!refreshToken) {
		await clearSession();

		throw unauthenticated();
	}

	try {
		const tokens = await send(
			"/auth/refresh",
			{
				method: "POST",
				body: { refreshToken },
				schema: issuedTokensSchema,
			},
			null,
		);

		const next = toSession(tokens);

		await setSession(next);

		return next;
	} catch (cause) {
		// Being offline is not the same as being signed out, so the stored token
		// survives anything a retry could fix. A rejection is final: the server has
		// either expired the token or revoked the whole family as theft.
		if (!isApiError(cause) || !cause.isRetryable) await clearSession();

		throw cause;
	}
}

/**
 * The server kills a refresh token the moment it is exchanged and treats a
 * second presentation as theft, revoking every session in the family. Two
 * requests refreshing in parallel would do exactly that, so every caller waits
 * on the same rotation.
 */
export function refreshSession(): Promise<AuthSession> {
	refreshInFlight ??= rotateTokens().finally(() => {
		refreshInFlight = null;
	});

	return refreshInFlight;
}

export async function request<T = void>(path: string, options: RequestOptions<T> = {}): Promise<T> {
	if (!options.auth) return send(path, options, null);

	if (!hasFreshAccessToken()) await refreshSession();

	try {
		return await send(path, options, getAccessToken());
	} catch (cause) {
		if (!isApiError(cause) || cause.status !== 401) throw cause;

		await refreshSession();

		return send(path, options, getAccessToken());
	}
}

/**
 * Trades the stored refresh token for a live session on cold start. Returns null
 * when there is nothing to restore or the token was rejected; a retryable
 * failure is thrown so the caller can offer a retry instead of signing the user
 * out over a dropped connection.
 */
export async function restoreSession(): Promise<AuthSession | null> {
	try {
		return await refreshSession();
	} catch (cause) {
		if (isApiError(cause) && cause.isRetryable) throw cause;

		return null;
	}
}
