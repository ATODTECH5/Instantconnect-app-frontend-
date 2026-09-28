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
import type {
	ApiEventDetail,
	ApiEventPage,
	ApiEventVenue,
	ApiNearbyEventPage,
} from "@/lib/api/event-schema";
import {
	createEvent,
	type EventRole,
	type EventTimeframe,
	fetchEvent,
	fetchMyEvents,
	fetchNearbyEvents,
	fetchRecentVenues,
	joinEvent,
	leaveEvent,
	type NearbyEventsQuery,
	type NewEvent,
	uploadEventCover,
} from "./event-service";

export const EVENTS_KEY = ["events"] as const;

const myEventsKey = (when: EventTimeframe, role: EventRole) =>
	[...EVENTS_KEY, "mine", when, role] as const;
const nearbyEventsKey = (query: NearbyEventsQuery) => [...EVENTS_KEY, "nearby", query] as const;
const eventKey = (id: string) => [...EVENTS_KEY, "detail", id] as const;
const RECENT_VENUES_KEY = [...EVENTS_KEY, "recent-venues"] as const;

export function useMyEvents(
	when: EventTimeframe,
	role: EventRole = "host",
): UseQueryResult<ApiEventPage> {
	return useQuery({
		queryKey: myEventsKey(when, role),
		queryFn: () => fetchMyEvents(when, role),
	});
}

export function useNearbyEvents(query: NearbyEventsQuery): UseQueryResult<ApiNearbyEventPage> {
	return useQuery({ queryKey: nearbyEventsKey(query), queryFn: () => fetchNearbyEvents(query) });
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

/**
 * Joining and leaving both answer with the whole event, so the detail cache
 * is replaced; every list that shows attendance, and the profile's Events
 * Joined count, is refetched.
 */
function useAttendanceMutation(
	mutationFn: (id: string) => Promise<ApiEventDetail>,
): UseMutationResult<ApiEventDetail, Error, string> {
	const client = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: (event) => {
			client.setQueryData(eventKey(event.id), event);
			void client.invalidateQueries({ queryKey: [...EVENTS_KEY, "mine"] });
			void client.invalidateQueries({ queryKey: [...EVENTS_KEY, "nearby"] });
			void client.invalidateQueries({ queryKey: ["users", "me"] });
		},
	});
}

export function useJoinEvent(): UseMutationResult<ApiEventDetail, Error, string> {
	return useAttendanceMutation(joinEvent);
}

export function useLeaveEvent(): UseMutationResult<ApiEventDetail, Error, string> {
	return useAttendanceMutation(leaveEvent);
}

/** Seeds the detail cache, so the screen it lands on opens without a spinner. */
export function useCreateEvent(): UseMutationResult<ApiEventDetail, Error, NewEvent> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: createEvent,
		onSuccess: (event) => {
			client.setQueryData(eventKey(event.id), event);
			void client.invalidateQueries({ queryKey: [...EVENTS_KEY, "mine"] });
			void client.invalidateQueries({ queryKey: [...EVENTS_KEY, "nearby"] });
			void client.invalidateQueries({ queryKey: RECENT_VENUES_KEY });
		},
	});
}
