import type { NearbyPerson } from "@/features/home/home-feed";

/** Everything the Profile Details frame shows that a card does not. */
export type PersonProfile = NearbyPerson & {
	bio: string;
	hobbies: string[];
};

/**
 * Stand-in for `GET /discovery`, mirroring `home-feed` so the screen's loading,
 * empty and error paths are exercisable before the endpoint exists. The home
 * carousel reads the same list, since both surfaces render `PersonCard` and the
 * one endpoint will replace both.
 */
const MOCK_LATENCY_MS = 700;

export class DiscoverError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const PEOPLE: PersonProfile[] = [
	{
		id: "iyan-filani",
		name: "Iyan Filani",
		age: 27,
		category: "Business",
		role: "Product Manager",
		distanceKm: 250,
		photo: require("@/assets/onboarding/avatar-1.jpg"),
		isVerified: true,
		isOnline: true,
		bio: "Skilled at turning ideas into impactful solutions by aligning user needs with business goals.",
		hobbies: ["Music", "Art", "Travel", "Photography", "Reading"],
	},
	{
		id: "zainab-okoro",
		name: "Zainab Okoro",
		age: 24,
		category: "Talents",
		role: "Sound Engineer",
		distanceKm: 12,
		photo: require("@/assets/onboarding/avatar-2.jpg"),
		isVerified: true,
		isOnline: true,
		bio: "Mixes live sets across Lagos and is always looking for new rooms to record in.",
		hobbies: ["Music", "Film", "Cycling"],
	},
	{
		id: "tunde-bakare",
		name: "Tunde Bakare",
		age: 31,
		category: "Friendship",
		role: "Physiotherapist",
		distanceKm: 4,
		photo: require("@/assets/onboarding/avatar-3.jpg"),
		isVerified: false,
		isOnline: false,
		bio: "Weekend footballer who would rather meet over a long walk than a long lunch.",
		hobbies: ["Football", "Hiking", "Cooking"],
	},
	{
		id: "amara-eze",
		name: "Amara Eze",
		age: 29,
		category: "Social",
		role: "Event Curator",
		distanceKm: 38,
		photo: require("@/assets/onboarding/avatar-4.jpg"),
		isVerified: true,
		isOnline: false,
		bio: "Builds small rooms with good people in them, from supper clubs to gallery nights.",
		hobbies: ["Art", "Food", "Dance", "Travel"],
	},
	{
		id: "kelechi-nwosu",
		name: "Kelechi Nwosu",
		age: 26,
		category: "Business",
		role: "Brand Strategist",
		distanceKm: 61,
		photo: require("@/assets/onboarding/card-front.jpg"),
		isVerified: false,
		isOnline: true,
		bio: "Helps early teams say the one true thing about themselves before they say anything else.",
		hobbies: ["Reading", "Chess", "Running"],
	},
];

export async function fetchDiscoverPeople(categoryId: string): Promise<PersonProfile[]> {
	await delay(MOCK_LATENCY_MS);

	if (categoryId === "general") return PEOPLE;

	return PEOPLE.filter((person) => person.category.toLowerCase() === categoryId);
}

export async function fetchPersonProfile(id: string): Promise<PersonProfile> {
	await delay(MOCK_LATENCY_MS);

	const person = PEOPLE.find((candidate) => candidate.id === id);

	if (!person) throw new DiscoverError("That profile is no longer available.");

	return person;
}
