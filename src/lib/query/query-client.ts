import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "@/lib/api/api-error";

const MAX_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 8_000;
const STALE_TIME_MS = 30_000;

/**
 * A phone loses connectivity constantly, so a query retries a dropped request
 * rather than dropping straight to an error state. A rejection the server has
 * already decided on (a 401, a 404, a validation failure) is not retried, since
 * sending it again produces the same answer.
 */
export function createQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: STALE_TIME_MS,
				retry: (failureCount, error) =>
					failureCount < MAX_RETRIES && (!isApiError(error) || error.isRetryable),
				retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, MAX_RETRY_DELAY_MS),
			},
			mutations: {
				// Nothing here is safe to send twice: a resent registration or code
				// submission burns a rate limit slot and can charge an SMS or email.
				retry: 0,
			},
		},
	});
}
