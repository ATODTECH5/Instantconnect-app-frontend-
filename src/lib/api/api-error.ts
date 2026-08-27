/**
 * The `code` field of the server's error envelope, plus the failures that never
 * reach the server. Screens switch on these; the message is only ever
 * displayed, since the server writes it to be safe to show as written.
 */
export type ApiErrorCode =
	| "ACCOUNT_SUSPENDED"
	| "EMAIL_ALREADY_VERIFIED"
	| "EMAIL_NOT_VERIFIED"
	| "EMAIL_TAKEN"
	| "FORBIDDEN"
	| "INVALID_CODE"
	| "INVALID_CREDENTIALS"
	| "INVALID_PHOTO_POSITION"
	| "INVALID_REFRESH_TOKEN"
	| "INVALID_RESET_TOKEN"
	| "INVALID_UPLOAD_REFERENCE"
	| "MAIL_DELIVERY_FAILED"
	| "NOT_FOUND"
	| "PHONE_TAKEN"
	| "RESOURCE_CONFLICT"
	| "STORAGE_NOT_CONFIGURED"
	| "TOO_MANY_ATTEMPTS"
	| "UNAUTHENTICATED"
	| "UNKNOWN_CATEGORY"
	| "UNKNOWN_HOBBY"
	| "UNKNOWN_OCCUPATION"
	| "UPLOAD_NOT_FOUND"
	| "USERNAME_TAKEN"
	| "USER_NOT_FOUND"
	| "VALIDATION_FAILED"
	| "INTERNAL_SERVER_ERROR"
	| "NETWORK_UNAVAILABLE"
	| "TIMEOUT"
	| "MALFORMED_RESPONSE"
	| "UPLOAD_REJECTED"
	| "UPLOAD_TRANSPORT_FAILED";

export type ApiErrorEnvelope = {
	statusCode: number;
	code: string;
	message: string;
	details?: string[];
	requestId: string;
	timestamp: string;
	path: string;
};

const NETWORK_MESSAGE = "We could not reach the server. Check your connection and try again.";
const TIMEOUT_MESSAGE = "That took too long. Check your connection and try again.";
const UNEXPECTED_MESSAGE = "Something went wrong on our end. Please try again.";

export class ApiError extends Error {
	readonly code: ApiErrorCode;
	readonly status: number;
	readonly details: string[];
	readonly requestId: string | null;

	constructor(init: {
		code: ApiErrorCode;
		message: string;
		status?: number;
		details?: string[];
		requestId?: string | null;
	}) {
		super(init.message);
		this.name = "ApiError";
		this.code = init.code;
		this.status = init.status ?? 0;
		this.details = init.details ?? [];
		this.requestId = init.requestId ?? null;
	}

	/** True for anything a retry could plausibly fix, which drives the query retry policy. */
	get isRetryable(): boolean {
		return (
			this.code === "NETWORK_UNAVAILABLE" ||
			this.code === "TIMEOUT" ||
			this.status === 0 ||
			this.status >= 500
		);
	}
}

export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

export function networkError(): ApiError {
	return new ApiError({ code: "NETWORK_UNAVAILABLE", message: NETWORK_MESSAGE });
}

export function timeoutError(): ApiError {
	return new ApiError({ code: "TIMEOUT", message: TIMEOUT_MESSAGE });
}

export function malformedResponseError(): ApiError {
	return new ApiError({ code: "MALFORMED_RESPONSE", message: UNEXPECTED_MESSAGE });
}

/**
 * The storage provider answered and refused. Its own wording is carried through
 * because it names the actual cause (a stale signature, a rejected file), which
 * a generic message would hide from both the user and the logs.
 */
export function uploadRejectedError(status: number, detail: string | null): ApiError {
	return new ApiError({
		code: "UPLOAD_REJECTED",
		message: detail
			? `The photo service refused the upload: ${detail}`
			: `The photo service refused the upload (status ${status}).`,
		status,
	});
}

/** The upload never reached the provider: no response, so nothing to read. */
export function uploadTransportError(detail: string | null): ApiError {
	return new ApiError({
		code: "UPLOAD_TRANSPORT_FAILED",
		message: detail
			? `The photo could not be sent: ${detail}`
			: "The photo could not be sent. Check your connection and try again.",
	});
}

function isEnvelope(value: unknown): value is ApiErrorEnvelope {
	if (typeof value !== "object" || value === null) return false;

	const candidate = value as Partial<ApiErrorEnvelope>;

	return typeof candidate.code === "string" && typeof candidate.message === "string";
}

/**
 * A 4xx or 5xx that did not come from the exception filter (a proxy, a tunnel,
 * an HTML error page) has no envelope to read, so it is reported as an
 * unexpected failure rather than surfacing raw upstream text to the user.
 */
export function errorFromResponse(status: number, body: unknown): ApiError {
	if (!isEnvelope(body)) {
		return new ApiError({
			code: "INTERNAL_SERVER_ERROR",
			message: UNEXPECTED_MESSAGE,
			status,
		});
	}

	return new ApiError({
		code: body.code as ApiErrorCode,
		message: body.message,
		status,
		details: body.details,
		requestId: body.requestId,
	});
}

/** The one place a thrown value becomes copy a screen can render. */
export function describeError(cause: unknown): string {
	return isApiError(cause) ? cause.message : UNEXPECTED_MESSAGE;
}
