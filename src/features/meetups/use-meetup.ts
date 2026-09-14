import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import { CONVERSATIONS_KEY } from "@/features/chat/use-conversations";
import { MESSAGES_KEY } from "@/features/chat/use-thread";
import type { ApiMeetup } from "@/lib/api/meetup-schema";
import { OPEN_MEETUP_KEY } from "./meetup-keys";
import {
	acceptMeetup,
	cancelMeetup,
	counterMeetup,
	declineMeetup,
	fetchOpenMeetup,
	type MeetupVenueInput,
	proposeMeetup,
} from "./meetup-service";


/** The one open meetup in a thread, or null. Drives the composer's propose button. */
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
	| { type: "cancel"; id: string };

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
