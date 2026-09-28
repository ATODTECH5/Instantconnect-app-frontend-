import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import { CONNECTIONS_KEY } from "@/features/connections/use-connections";
import { fetchConnections } from "@/features/discover/discovery-service";
import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import type { ApiConnectionPage } from "@/lib/api/discovery-schema";
import type { ApiEventDetail, ApiEventPage, ApiEventVenue } from "@/lib/api/event-schema";
import {
	createEvent,
	type EventTimeframe,
	fetchEvent,
	fetchMyEvents,
	fetchRecentVenues,
	type NewEvent,
	uploadEventCover,
} from "./event-service";

export const EVENTS_KEY = ["events"] as const;

const myEventsKey = (when: EventTimeframe) => [...EVENTS_KEY, "mine", when] as const;
const eventKey = (id: string) => [...EVENTS_KEY, "detail", id] as const;
const RECENT_VENUES_KEY = [...EVENTS_KEY, "recent-venues"] as const;

export function useMyEvents(when: EventTimeframe): UseQueryResult<ApiEventPage> {
	return useQuery({ queryKey: myEventsKey(when), queryFn: () => fetchMyEvents(when) });
}

export function useEvent(id: string): UseQueryResult<ApiEventDetail> {
	return useQuery({ queryKey: eventKey(id), queryFn: () => fetchEvent(id), enabled: !!id });
}

export function useRecentVenues(enabled: boolean): UseQueryResult<ApiEventVenue[]> {
	return useQuery({ queryKey: RECENT_VENUES_KEY, queryFn: fetchRecentVenues, enabled });
}

/** The server's page cap, which is also the most people one event can invite. */
const INVITABLE_LIMIT = 50;

export function useInvitableConnections(enabled: boolean): UseQueryResult<ApiConnectionPage> {
	return useQuery({
		queryKey: [...CONNECTIONS_KEY, "accepted", "invitable"],
		queryFn: () => fetchConnections("accepted", INVITABLE_LIMIT),
		enabled,
	});
}

export function useUploadEventCover(): UseMutationResult<string, Error, PickedPhoto> {
	return useMutation({ mutationFn: uploadEventCover });
}

/** Seeds the detail cache, so the screen it lands on opens without a spinner. */
export function useCreateEvent(): UseMutationResult<ApiEventDetail, Error, NewEvent> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: createEvent,
		onSuccess: (event) => {
			client.setQueryData(eventKey(event.id), event);
			void client.invalidateQueries({ queryKey: [...EVENTS_KEY, "mine"] });
			void client.invalidateQueries({ queryKey: RECENT_VENUES_KEY });
		},
	});
}
