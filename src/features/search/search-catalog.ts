import type { ImageSourcePropType } from "react-native";

import {
	ratingFloor,
	type SearchFilters,
	type SearchTabId,
} from "@/features/search/search-filters";

export type SearchPerson = {
	id: string;
	name: string;
	age: number;
	category: string;
	distanceKm: number;
	photo: ImageSourcePropType;
	isVerified: boolean;
	isOnline: boolean;
};

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
 * Stand-in for the discovery API, mirroring `home-feed` so the screen's
 * loading, empty and error paths are exercisable before the backend exists.
 * The server has no search, places or events module yet. Swapping these two
 * functions for real requests is the only change the screens need.
 */
const MOCK_LATENCY_MS = 650;

export class SearchError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PEOPLE: SearchPerson[] = [
	{
		id: "halima",
		name: "Halima",
		age: 26,
		category: "Talent",
		distanceKm: 250,
		photo: require("@/assets/onboarding/avatar-2.jpg"),
		isVerified: true,
		isOnline: true,
	},
	{
		id: "iyan-filani",
		name: "Iyan Filani",
		age: 27,
		category: "Business",
		distanceKm: 250,
		photo: require("@/assets/onboarding/avatar-1.jpg"),
		isVerified: true,
		isOnline: true,
	},
	{
		id: "eva-rose",
		name: "Eva Rose",
		age: 29,
		category: "Talent",
		distanceKm: 250,
		photo: require("@/assets/onboarding/avatar-4.jpg"),
		isVerified: true,
		isOnline: false,
	},
	{
		id: "calvin-osa",
		name: "Calvin Osa",
		age: 31,
		category: "Talent",
		distanceKm: 250,
		photo: require("@/assets/onboarding/avatar-3.jpg"),
		isVerified: true,
		isOnline: false,
	},
	{
		id: "lola-aziz",
		name: "Lola Aziz",
		age: 28,
		category: "Talent",
		distanceKm: 250,
		photo: require("@/assets/onboarding/avatar-5.png"),
		isVerified: true,
		isOnline: true,
	},
];

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

function keepPerson(person: SearchPerson, query: string, filters: SearchFilters) {
	if (filters.verifiedOnly && !person.isVerified) return false;
	if (filters.onlineStatus === "online" && !person.isOnline) return false;
	if (query.length > 0 && !matches(`${person.name} ${person.category}`, query)) return false;

	return true;
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

export async function fetchSearchResults({
	query,
	tab,
	filters,
}: SearchRequest): Promise<SearchResults> {
	await delay(MOCK_LATENCY_MS);

	const term = query.trim();

	const people = PEOPLE.filter((person) => keepPerson(person, term, filters));
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
