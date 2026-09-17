import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { ApiReferral, ApiReferrals } from "@/lib/api/referrals-schema";
import { fetchReferral, fetchReferrals } from "./referrals-service";

export const REFERRALS_KEY = ["referrals"] as const;

export function useReferrals(): UseQueryResult<ApiReferrals> {
	return useQuery({ queryKey: REFERRALS_KEY, queryFn: fetchReferrals });
}

export function useReferral(id: string): UseQueryResult<ApiReferral> {
	return useQuery({
		queryKey: [...REFERRALS_KEY, id],
		queryFn: () => fetchReferral(id),
	});
}
