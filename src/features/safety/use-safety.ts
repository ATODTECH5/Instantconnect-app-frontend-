import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import type { ApiCircle, ApiDispatchPlan, ApiDispatchResult } from "@/lib/api/safety-schema";
import {
	addMember,
	createCircle,
	deleteCircle,
	fetchCircles,
	fetchDispatchPlan,
	type NewMember,
	removeMember,
	selectCircles,
	sendCheckIn,
} from "./safety-service";

export const CIRCLES_KEY = ["safety", "circles"] as const;
export const DISPATCH_PLAN_KEY = ["safety", "plan"] as const;

export function useCircles(): UseQueryResult<ApiCircle[]> {
	return useQuery({ queryKey: CIRCLES_KEY, queryFn: fetchCircles });
}

type CircleAction =
	| { type: "create"; name: string }
	| { type: "delete"; id: string }
	| { type: "addMember"; circleId: string; member: NewMember }
	| { type: "removeMember"; circleId: string; memberId: string };

async function runCircleAction(action: CircleAction): Promise<void> {
	switch (action.type) {
		case "create":
			await createCircle(action.name);
			return;
		case "delete":
			await deleteCircle(action.id);
			return;
		case "addMember":
			await addMember(action.circleId, action.member);
			return;
		case "removeMember":
			await removeMember(action.circleId, action.memberId);
			return;
	}
}

/** Every edit refetches the list; circles are few and the list is the screen. */
export function useCircleAction(): UseMutationResult<void, Error, CircleAction> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: runCircleAction,
		onSettled: () => client.invalidateQueries({ queryKey: CIRCLES_KEY }),
	});
}

export function useDispatchPlan(meetupId: string): UseQueryResult<ApiDispatchPlan> {
	return useQuery({
		queryKey: [...DISPATCH_PLAN_KEY, meetupId],
		queryFn: () => fetchDispatchPlan(meetupId),
	});
}

export function useSelectCircles(meetupId: string): UseMutationResult<string[], Error, string[]> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: (circleIds) => selectCircles(meetupId, circleIds),
		onSuccess: (circleIds) =>
			client.setQueryData<ApiDispatchPlan>([...DISPATCH_PLAN_KEY, meetupId], (current) =>
				current ? { ...current, circleIds } : current,
			),
	});
}

export function useSendCheckIn(meetupId: string): UseMutationResult<ApiDispatchResult, Error, void> {
	return useMutation({ mutationFn: () => sendCheckIn(meetupId) });
}
