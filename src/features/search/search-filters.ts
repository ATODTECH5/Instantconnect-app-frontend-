export type SearchTabId = "all" | "people" | "events" | "restaurant" | "workspace";

export type SearchTab = {
	id: SearchTabId;
	label: string;
};

/**
 * The artboards spell these inconsistently ("Restaurants" on one frame,
 * "Restaurant" on the next, "events" lowercase on another). Title case singular
 * is used throughout.
 */
export const SEARCH_TABS: SearchTab[] = [
	{ id: "all", label: "All" },
	{ id: "people", label: "People" },
	{ id: "events", label: "Events" },
	{ id: "restaurant", label: "Restaurant" },
	{ id: "workspace", label: "Work Space" },
];

export function isSearchTabId(value: string): value is SearchTabId {
	return SEARCH_TABS.some((tab) => tab.id === value);
}

export type LookingForId = "people" | "coffee" | "talents" | "coworking" | "general";

export const LOOKING_FOR: { id: LookingForId; label: string }[] = [
	{ id: "people", label: "People" },
	{ id: "coffee", label: "Coffee shops" },
	{ id: "talents", label: "Talents" },
	{ id: "coworking", label: "Coworking spaces" },
	{ id: "general", label: "General" },
];

/** Doubles as the Popular Searches row on the idle state. */
export const POPULAR_SEARCHES = LOOKING_FOR.map(({ label }) => label);

export type OnlineStatusId = "any" | "online" | "recent";

export const ONLINE_STATUS: { id: OnlineStatusId; label: string }[] = [
	{ id: "any", label: "Any" },
	{ id: "online", label: "Online" },
	{ id: "recent", label: "Recently Active" },
];

export type RatingId = "any" | "four" | "fourFive";

export const RATING_OPTIONS: { id: RatingId; label: string; floor: number }[] = [
	{ id: "any", label: "Any Rating", floor: 0 },
	{ id: "four", label: "4.0+", floor: 4 },
	{ id: "fourFive", label: "4.5+", floor: 4.5 },
];

export const DISTANCE_STEPS = [1, 5, 10, 20] as const;

export const MIN_DISTANCE_KM = DISTANCE_STEPS[0];
export const MAX_DISTANCE_KM = DISTANCE_STEPS[DISTANCE_STEPS.length - 1];

export type SearchFilters = {
	lookingFor: LookingForId;
	categoryId: string | null;
	distanceKm: number;
	onlineStatus: OnlineStatusId;
	rating: RatingId;
	verifiedOnly: boolean;
};

export const DEFAULT_FILTERS: SearchFilters = {
	lookingFor: "people",
	categoryId: null,
	distanceKm: 5,
	onlineStatus: "any",
	rating: "any",
	verifiedOnly: false,
};

export function ratingFloor(id: RatingId) {
	return RATING_OPTIONS.find((option) => option.id === id)?.floor ?? 0;
}

/**
 * Filters travel to the filter route and back through router params, which are
 * strings, so they are serialised rather than held in a provider.
 */
export function encodeFilters(filters: SearchFilters) {
	return JSON.stringify(filters);
}

export function decodeFilters(raw: string | undefined): SearchFilters {
	if (!raw) return DEFAULT_FILTERS;

	try {
		const parsed: unknown = JSON.parse(raw);

		if (typeof parsed !== "object" || parsed === null) return DEFAULT_FILTERS;

		return { ...DEFAULT_FILTERS, ...(parsed as Partial<SearchFilters>) };
	} catch {
		return DEFAULT_FILTERS;
	}
}

export function countActiveFilters(filters: SearchFilters) {
	let count = 0;

	if (filters.lookingFor !== DEFAULT_FILTERS.lookingFor) count += 1;
	if (filters.categoryId !== null) count += 1;
	if (filters.distanceKm !== DEFAULT_FILTERS.distanceKm) count += 1;
	if (filters.onlineStatus !== DEFAULT_FILTERS.onlineStatus) count += 1;
	if (filters.rating !== DEFAULT_FILTERS.rating) count += 1;
	if (filters.verifiedOnly) count += 1;

	return count;
}
