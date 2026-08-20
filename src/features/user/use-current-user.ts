import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { request } from "@/lib/api/api-client";
import { userSchema, type ApiUser } from "@/lib/api/user-schema";

function fetchCurrentUser(): Promise<ApiUser> {
	return request("/users/me", { schema: userSchema, auth: true });
}

/**
 * The signed in account, held in the query cache rather than the session store,
 * which keeps only what has to survive a cold start. The cache is cleared with
 * the session, so one account's profile can never be read by the next.
 */
export function useCurrentUser(): UseQueryResult<ApiUser> {
	return useQuery({ queryKey: ["users", "me"], queryFn: fetchCurrentUser });
}
