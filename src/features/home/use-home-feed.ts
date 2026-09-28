import { useCallback } from "react";

import { useNearbyPeople } from "@/features/discover/use-discover";
import { useNearbyEvents } from "@/features/events/use-events";
import { useUnreadNotificationCount } from "@/features/notifications/use-notifications";
import { useProfile } from "@/features/profile/use-profile";
import { isApiError } from "@/lib/api/api-error";
import type { ApiNearbyPerson } from "@/lib/api/discovery-schema";
import type { ApiNearbyEvent } from "@/lib/api/event-schema";

/** What the carousel shows before the grid takes over on Discover. */
const HOME_CARD_COUNT = 10;

export type HomeFeedStatus = "loading" | "ready" | "error";

export type HomeFeed = {
	place: string | null;
	unreadCount: number;
	matchCount: number;
	people: ApiNearbyPerson[];
	events: ApiNearbyEvent[];
	/** The events rail failed on its own; people still render. */
	eventsFailed: boolean;
};

export type HomeFeedState = {
	status: HomeFeedStatus;
	feed: HomeFeed | null;
	error: string | null;
	refreshing: boolean;
	/** True when the account has no coordinates, which discovery cannot answer without. */
	needsLocation: boolean;
	reload: () => void;
	refresh: () => void;
};

const GENERIC_ERROR = "We could not load your feed. Check your connection and try again.";

export function useHomeFeed(): HomeFeedState {
	const people = useNearbyPeople({ limit: HOME_CARD_COUNT });
	const events = useNearbyEvents({ limit: HOME_CARD_COUNT });
	const profile = useProfile();
	const unreadCount = useUnreadNotificationCount();

	const refetch = useCallback(() => {
		void people.refetch();
		void events.refetch();
		void profile.refetch();
	}, [people, events, profile]);

	const needsLocation = isApiError(people.error) && people.error.code === "LOCATION_REQUIRED";

	const feed: HomeFeed | null = people.data
		? {
				place: profile.data?.locationLabel ?? null,
				unreadCount,
				matchCount: people.data.page.total,
				people: people.data.items,
				events: events.data?.items ?? [],
				eventsFailed: events.isError,
			}
		: null;

	const status: HomeFeedStatus = people.isPending
		? "loading"
		: people.isError
			? "error"
			: "ready";

	return {
		status,
		feed,
		error: people.isError ? errorMessage(people.error) : null,
		refreshing: people.isRefetching || events.isRefetching,
		needsLocation,
		reload: refetch,
		refresh: refetch,
	};
}

function errorMessage(error: unknown): string {
	return isApiError(error) ? error.message : GENERIC_ERROR;
}
