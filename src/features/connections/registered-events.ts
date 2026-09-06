import type { ImageSourcePropType } from "react-native";

export type RegisteredEventTab = "upcoming" | "past" | "all";

/**
 * Shape the registered-events endpoint is expected to return. There is no
 * events table yet, so the screen reads the fixture below.
 *
 * When the endpoint lands: add the zod schema beside the others in `lib/api/`,
 * point `useRegisteredEvents()` at it, and delete `REGISTERED_EVENTS` together
 * with `assets/connections/fixtures/event-*.jpg`. Nothing in
 * `registered-event-card.tsx` should need to change.
 */
export type EventAttendee = {
	id: string;
	name: string;
	avatar: ImageSourcePropType;
};

export type RegisteredEvent = {
	id: string;
	title: string;
	venue: string;
	/** Full street line shown on the detail screen. */
	address: string;
	distanceKm: number;
	startsAt: string;
	photo: ImageSourcePropType;
	about: string;
	organiserName: string;
	organiserAvatar: ImageSourcePropType;
	/** Drives the "Verified Host Organization" line under the organiser. */
	isVerifiedHost: boolean;
	/** Minor units. Zero renders as "Free"; paid ticketing is not built. */
	priceMinor: number;
	attendees: EventAttendee[];
	attendeeCount: number;
	joinedAtLabel: string;
	isPast: boolean;
};

export const REGISTERED_EVENTS: RegisteredEvent[] = [
	{
		id: "startup-founders",
		title: "Startup Founders Meeting",
		venue: "CoLab Space",
		address: "CoLab Space, 91 Opebi Road, Ikeja, Lagos",
		distanceKm: 4.2,
		startsAt: "2026-09-20T10:00:00.000Z",
		photo: require("@/assets/connections/fixtures/event-founders.jpg"),
		about:
			"Join fellow startup founders for a morning of deep-dive networking and insight sharing. We'll be discussing growth strategies, fundraising in 2026, and product-market fit. Open to all stages!",
		organiserName: "Community Safety Patrol",
		organiserAvatar: require("@/assets/onboarding/avatar-5.png"),
		isVerifiedHost: true,
		priceMinor: 0,
		attendees: [
			{ id: "alex", name: "Alex", avatar: require("@/assets/onboarding/avatar-1.jpg") },
			{ id: "sarah", name: "Sarah", avatar: require("@/assets/onboarding/avatar-2.jpg") },
			{ id: "lexxi", name: "Lexxi", avatar: require("@/assets/onboarding/avatar-3.jpg") },
			{ id: "leemah", name: "Leemah", avatar: require("@/assets/onboarding/avatar-4.jpg") },
		],
		attendeeCount: 45,
		joinedAtLabel: "August 14, 2026",
		isPast: false,
	},
	{
		id: "creative-sketch",
		title: "Creative Sketch Session",
		venue: "Ikeja Art House",
		address: "Ikeja Art House, 12 Allen Avenue, Ikeja, Lagos",
		distanceKm: 7.8,
		startsAt: "2026-09-28T18:30:00.000Z",
		photo: require("@/assets/connections/fixtures/event-sketch.jpg"),
		about:
			"An evening of life drawing and loose sketching. Materials provided, all skill levels welcome. Bring a friend and stay for the critique session afterwards.",
		organiserName: "Ikeja Creatives Collective",
		organiserAvatar: require("@/assets/onboarding/avatar-2.jpg"),
		isVerifiedHost: true,
		priceMinor: 0,
		attendees: [
			{ id: "tinu", name: "Tinu", avatar: require("@/assets/onboarding/avatar-2.jpg") },
			{ id: "daniel", name: "Daniel", avatar: require("@/assets/onboarding/avatar-4.jpg") },
		],
		attendeeCount: 18,
		joinedAtLabel: "August 29, 2026",
		isPast: false,
	},
	{
		id: "sunset-run",
		title: "Sunset Run Club",
		venue: "Lekki Foreshore",
		address: "Lekki Foreshore Scheme, Lekki, Lagos",
		distanceKm: 12.4,
		startsAt: "2026-08-16T06:30:00.000Z",
		photo: require("@/assets/connections/fixtures/event-run.jpg"),
		about:
			"A steady 5km along the foreshore at sunset, followed by stretching and jollof. Pace groups from 6:00 to 8:00 min/km, so nobody runs alone.",
		organiserName: "Lagos Road Runners",
		organiserAvatar: require("@/assets/onboarding/avatar-3.jpg"),
		isVerifiedHost: false,
		priceMinor: 0,
		attendees: [
			{ id: "alex", name: "Alex", avatar: require("@/assets/onboarding/avatar-1.jpg") },
			{ id: "lexxi", name: "Lexxi", avatar: require("@/assets/onboarding/avatar-3.jpg") },
			{ id: "leemah", name: "Leemah", avatar: require("@/assets/onboarding/avatar-4.jpg") },
		],
		attendeeCount: 63,
		joinedAtLabel: "July 2, 2026",
		isPast: true,
	},
];

export function findRegisteredEvent(id: string): RegisteredEvent | undefined {
	return REGISTERED_EVENTS.find((event) => event.id === id);
}

export function eventsForTab(
	events: RegisteredEvent[],
	tab: RegisteredEventTab,
): RegisteredEvent[] {
	if (tab === "all") return events;

	return events.filter((event) => event.isPast === (tab === "past"));
}
