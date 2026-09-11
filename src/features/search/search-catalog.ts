import type { ImageSourcePropType } from "react-native";

import { fetchNearbyPeople } from "@/features/discover/discovery-service";
import {
	ratingFloor,
	type SearchFilters,
	type SearchTabId,
} from "@/features/search/search-filters";
import type { ApiNearbyPerson } from "@/lib/api/discovery-schema";

/**
 * People come from `GET /discovery/people`, so the row reads the server's shape
 * directly rather than a local one that would have to be kept in step with it.
 */
export type SearchPerson = ApiNearbyPerson;

export type PlaceKind = "restaurant" | "workspace";

export type SearchPlace = {
	id: string;
	name: string;
	kind: PlaceKind;
	distanceMetres: number;
	walkMinutes: number;
	rating: number;
	area: string;
	photo: ImageSourcePropType;
};

export type SearchMeetup = {
	id: string;
	title: string;
	venue: string;
	distanceKm: number;
	startsAt: string;
	photo: ImageSourcePropType;
	attendees: ImageSourcePropType[];
	extraAttendees: number;
};

export type SearchResults = {
	people: SearchPerson[];
	places: SearchPlace[];
	meetups: SearchMeetup[];
};

export function isEmptyResults(results: SearchResults) {
	return (
		results.people.length === 0 && results.places.length === 0 && results.meetups.length === 0
	);
}

/**
 * People are real: the People tab and the All tab's people section both read
 * `GET /discovery/people`. Places and events are still fixtures, because the
 * server has no module for either. Delete each array as its endpoint lands.
 */
const MOCK_LATENCY_MS = 650;

export class SearchError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PLACES: SearchPlace[] = [
	{
		id: "riverside",
		name: "Riverside Co-working Space",
		kind: "workspace",
		distanceMetres: 180,
		walkMinutes: 4,
		rating: 4.7,
		area: "Ikeja",
		photo: require("@/assets/onboarding/card-back-left.jpg"),
	},
	{
		id: "creative-lounge",
		name: "Creative Lounge",
		kind: "workspace",
		distanceMetres: 180,
		walkMinutes: 4,
		rating: 4.7,
		area: "Ikeja",
		photo: require("@/assets/onboarding/card-back-right.jpg"),
	},
	{
		id: "tech-hub",
		name: "Tech Hub",
		kind: "workspace",
		distanceMetres: 180,
		walkMinutes: 4,
		rating: 4.7,
		area: "Ikeja",
		photo: require("@/assets/onboarding/card-front.jpg"),
	},
	{
		id: "urban-hub",
		name: "Urban Hub",
		kind: "workspace",
		distanceMetres: 180,
		walkMinutes: 4,
		rating: 4.6,
		area: "Ikeja",
		photo: require("@/assets/onboarding/card-back-left.jpg"),
	},
	{
		id: "bloom-restaurant",
		name: "Bloom Restaurant",
		kind: "restaurant",
		distanceMetres: 180,
		walkMinutes: 4,
		rating: 4.7,
		area: "Ikeja",
		photo: require("@/assets/onboarding/card-back-right.jpg"),
	},
	{
		id: "brew-cafe",
		name: "Brew Café",
		kind: "restaurant",
		distanceMetres: 180,
		walkMinutes: 4,
		rating: 4.7,
		area: "Ikeja",
		photo: require("@/assets/onboarding/card-front.jpg"),
	},
	{
		id: "asa-garden",
		name: "Asa Garden",
		kind: "restaurant",
		distanceMetres: 180,
		walkMinutes: 4,
		rating: 4.5,
		area: "Ikeja",
		photo: require("@/assets/onboarding/card-back-left.jpg"),
	},
];

const ATTENDEES: ImageSourcePropType[] = [
	require("@/assets/onboarding/avatar-2.jpg"),
	require("@/assets/onboarding/avatar-4.jpg"),
	require("@/assets/onboarding/avatar-5.png"),
];

const MEETUPS: SearchMeetup[] = [
	{
		id: "startup-founders",
		title: "Startup Founders Meeting",
		venue: "Colab Space",
		distanceKm: 400,
		startsAt: "2026-07-20T10:00:00",
		photo: require("@/assets/onboarding/card-back-left.jpg"),
		attendees: ATTENDEES,
		extraAttendees: 14,
	},
	{
		id: "creative-sketch",
		title: "Creative Art Skitch Session",
		venue: "Colab Space",
		distanceKm: 400,
		startsAt: "2026-07-20T10:00:00",
		photo: require("@/assets/onboarding/card-back-right.jpg"),
		attendees: ATTENDEES,
		extraAttendees: 14,
	},
];

const SUGGESTIONS = ["Café Bloom", "CoLab Workspace", "Freedom Pack", "Events"];

function matches(haystack: string, needle: string) {
	return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function fetchSuggestions(query: string): Promise<string[]> {
	await delay(MOCK_LATENCY_MS / 2);

	const trimmed = query.trim();

	if (trimmed.length === 0) return [];

	// Everything is offered while the term is still short, so the list reads as
	// recent destinations rather than emptying out on the first keystroke.
	if (trimmed.length < 3) return SUGGESTIONS;

	return SUGGESTIONS.filter((entry) => matches(entry, trimmed));
}

/**
 * Category, distance, verified and online are query parameters the server
 * applies, so only the free text term is left to narrow here. Discovery has no
 * name search of its own yet; when it grows one, this goes too.
 */
function keepPerson(person: SearchPerson, query: string) {
	if (query.length === 0) return true;

	return matches(`${person.fullName} ${person.category?.label ?? ""}`, query);
}

/**
 * `rating` has no server support and no source for people, so it is not sent.
 * `lookingFor` is a search hint rather than a filter and has nowhere to go yet.
 */
async function searchPeople(
	query: string,
	filters: SearchFilters,
): Promise<SearchPerson[]> {
	const page = await fetchNearbyPeople({
		categoryId: filters.categoryId ?? undefined,
		radiusKm: filters.distanceKm,
		verifiedOnly: filters.verifiedOnly || undefined,
		onlineOnly: filters.onlineStatus === "online" || undefined,
	});

	return page.items.filter((person) => keepPerson(person, query));
}

function keepPlace(place: SearchPlace, query: string, filters: SearchFilters) {
	if (place.rating < ratingFloor(filters.rating)) return false;
	if (query.length > 0 && !matches(`${place.name} ${place.area}`, query)) return false;

	return true;
}

function keepMeetup(meetup: SearchMeetup, query: string) {
	if (query.length > 0 && !matches(`${meetup.title} ${meetup.venue}`, query)) return false;

	return true;
}

export type SearchRequest = {
	query: string;
	tab: SearchTabId;
	filters: SearchFilters;
};

/** Tabs that show no people at all, and so should not spend a request on them. */
const PLACE_ONLY_TABS: SearchTabId[] = ["events", "restaurant", "workspace"];

export async function fetchSearchResults({
	query,
	tab,
	filters,
}: SearchRequest): Promise<SearchResults> {
	const term = query.trim();

	const people = PLACE_ONLY_TABS.includes(tab)
		? []
		: await searchPeople(term, filters);

	// Still fixtures, so still faked latency. People no longer wait on it.
	if (PLACE_ONLY_TABS.includes(tab)) await delay(MOCK_LATENCY_MS);

	const places = PLACES.filter((place) => keepPlace(place, term, filters));
	const meetups = MEETUPS.filter((meetup) => keepMeetup(meetup, term));

	if (tab === "people") return { people, places: [], meetups: [] };
	if (tab === "events") return { people: [], places: [], meetups };

	if (tab === "restaurant" || tab === "workspace") {
		const kind: PlaceKind = tab === "restaurant" ? "restaurant" : "workspace";

		return {
			people: [],
			places: places.filter((place) => place.kind === kind),
			meetups: [],
		};
	}

	// The All tab leads with people and places, matching the artboard, and keeps
	// meetups to their own tab so the list does not run past three sections.
	return { people: people.slice(0, 3), places: places.slice(0, 2), meetups: [] };
}
