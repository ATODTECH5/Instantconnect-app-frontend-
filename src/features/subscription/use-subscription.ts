import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import type { ApiCheckoutResult, ApiMySubscription } from "@/lib/api/subscription-schema";

import { type Plan, toPlan } from "./plans";
import {
	cancelSubscription,
	confirmCheckout,
	fetchMySubscription,
	fetchPlans,
} from "./subscription-service";

const SUBSCRIPTION_KEY = ["subscription"] as const;
const PLANS_KEY = [...SUBSCRIPTION_KEY, "plans"] as const;
const MINE_KEY = [...SUBSCRIPTION_KEY, "me"] as const;

export function usePlans(): UseQueryResult<Plan[]> {
	return useQuery({
		queryKey: PLANS_KEY,
		queryFn: async () => (await fetchPlans()).map(toPlan),
	});
}

export function useMySubscription(): UseQueryResult<ApiMySubscription> {
	return useQuery({ queryKey: MINE_KEY, queryFn: fetchMySubscription });
}

/** The answer carries the member's plan, so it becomes the cached one. */
export function useConfirmCheckout(): UseMutationResult<ApiCheckoutResult, Error, string> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: confirmCheckout,
		onSuccess: (result) => client.setQueryData(MINE_KEY, result.subscription),
	});
}

export function useCancelSubscription(): UseMutationResult<ApiMySubscription, Error, void> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: cancelSubscription,
		onSuccess: (subscription) => client.setQueryData(MINE_KEY, subscription),
	});
}
