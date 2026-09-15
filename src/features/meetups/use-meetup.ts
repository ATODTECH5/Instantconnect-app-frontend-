import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import { CONVERSATIONS_KEY } from "@/features/chat/use-conversations";
import { MESSAGES_KEY } from "@/features/chat/use-thread";
import type {
	ApiArrivalCode,
	ApiMeetup,
	ApiMeetupParty,
	ApiVerifyCode,
} from "@/lib/api/meetup-schema";
import { MEETUP_KEY, OPEN_MEETUP_KEY } from "./meetup-keys";
import {
	acceptMeetup,
	cancelMeetup,
	counterMeetup,
	declineMeetup,
	endMeetup,
	fetchMeetup,
	fetchOpenMeetup,
	issueArrivalCode,
	type MeetupVenueInput,
	proposeMeetup,
	reportLocation,
	setArrival,
	setLocationSharing,
	verifyArrivalCode,
} from "./meetup-service";


/** The one open meetup in a thread, or null. Drives the composer's propose button. */
export function useMeetup(id: string): UseQueryResult<ApiMeetup> {
	return useQuery({
		queryKey: [...MEETUP_KEY, id],
		queryFn: () => fetchMeetup(id),
	});
}

export function useOpenMeetup(conversationId: string): UseQueryResult<ApiMeetup | null> {
	return useQuery({
		queryKey: [...OPEN_MEETUP_KEY, conversationId],
		queryFn: () => fetchOpenMeetup(conversationId),
	});
}

/**
 * Every transition changes three things at once: the open meetup, the cards
 * already in the thread (they re-read state), and the chat list preview. One
 * invalidation covers all three rather than each mutation remembering.
 */
export function useInvalidateMeetup(conversationId: string): () => Promise<void> {
	const client = useQueryClient();

	return async () => {
		await Promise.all([
			client.invalidateQueries({ queryKey: MEETUP_KEY }),
			client.invalidateQueries({ queryKey: [...OPEN_MEETUP_KEY, conversationId] }),
			client.invalidateQueries({ queryKey: [...MESSAGES_KEY, conversationId] }),
			client.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
		]);
	};
}

type Action =
	| { type: "propose"; proposedTimes: string[]; venue?: MeetupVenueInput }
	| { type: "accept"; id: string; scheduledAt: string }
	| { type: "decline"; id: string }
	| { type: "counter"; id: string; proposedTimes: string[] }
	| { type: "cancel"; id: string }
	| { type: "end"; id: string };

function run(conversationId: string, action: Action): Promise<ApiMeetup> {
	switch (action.type) {
		case "propose":
			return proposeMeetup({
				conversationId,
				proposedTimes: action.proposedTimes,
				venue: action.venue,
			});
		case "accept":
			return acceptMeetup(action.id, action.scheduledAt);
		case "decline":
			return declineMeetup(action.id);
		case "counter":
			return counterMeetup(action.id, action.proposedTimes);
		case "cancel":
			return cancelMeetup(action.id);
		case "end":
			return endMeetup(action.id);
	}
}

/** One mutation for every transition, so a card has one pending flag to read. */
export function useMeetupAction(
	conversationId: string,
): UseMutationResult<ApiMeetup, Error, Action> {
	const invalidate = useInvalidateMeetup(conversationId);

	return useMutation({
		mutationFn: (action: Action) => run(conversationId, action),
		onSettled: () => invalidate(),
	});
}

/**
 * The code comes back exactly once, so it lives in mutation state rather
 * than the query cache: a refetch of the meetup would not bring it back.
 */
export function useIssueArrivalCode(
	meetup: ApiMeetup,
): UseMutationResult<ApiArrivalCode, Error, void> {
	const invalidate = useInvalidateMeetup(meetup.conversationId);

	return useMutation({
		mutationFn: () => issueArrivalCode(meetup.id),
		onSettled: () => invalidate(),
	});
}

export function useVerifyArrivalCode(
	meetup: ApiMeetup,
): UseMutationResult<ApiVerifyCode, Error, string> {
	const invalidate = useInvalidateMeetup(meetup.conversationId);

	return useMutation({
		mutationFn: (code: string) => verifyArrivalCode(meetup.id, code),
		onSettled: () => invalidate(),
	});
}

export function useSetArrival(
	meetup: ApiMeetup,
): UseMutationResult<ApiMeetup, Error, "en_route" | "arrived"> {
	const invalidate = useInvalidateMeetup(meetup.conversationId);

	return useMutation({
		mutationFn: (state) => setArrival(meetup.id, state),
		onSettled: () => invalidate(),
	});
}

export function useSetLocationSharing(
	meetup: ApiMeetup,
): UseMutationResult<ApiMeetup, Error, boolean> {
	const invalidate = useInvalidateMeetup(meetup.conversationId);

	return useMutation({
		mutationFn: (enabled) => setLocationSharing(meetup.id, enabled),
		onSettled: () => invalidate(),
	});
}

/**
 * Deliberately does not invalidate anything: a fix lands every several
 * seconds and refetching the meetup each time would be most of the traffic.
 * The response patches `me` in the cached meetup instead.
 */
export function useReportLocation(
	meetup: ApiMeetup,
): UseMutationResult<ApiMeetupParty, Error, { latitude: number; longitude: number; accuracyM?: number }> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: (fix) => reportLocation(meetup.id, fix),
		onSuccess: (me) => {
			client.setQueryData<ApiMeetup>([...MEETUP_KEY, meetup.id], (current) =>
				current ? { ...current, me } : current,
			);
		},
	});
}
