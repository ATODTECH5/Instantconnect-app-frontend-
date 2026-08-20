import type { ImageSourcePropType } from "react-native";

export type NearbyPerson = {
	id: string;
	name: string;
	age: number;
	category: string;
	role: string;
	distanceKm: number;
	photo: ImageSourcePropType;
	isVerified: boolean;
	isOnline: boolean;
};

export type NearbyEvent = {
	id: string;
	title: string;
	venue: string;
	priceMinor: number;
	currencySymbol: string;
	photo: ImageSourcePropType;
};

export type HomeFeed = {
	avatar: ImageSourcePropType;
	isOnline: boolean;
	place: string;
	unreadCount: number;
	matchCount: number;
	people: NearbyPerson[];
	events: NearbyEvent[];
};

/**
 * Stand-in for the discovery API, mirroring `auth-service` so the screen's
 * loading, empty and error paths are exercisable before the backend exists.
 * Swapping this body for a real request is the only change the screen needs.
 */
const MOCK_LATENCY_MS = 900;

export class HomeFeedError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PEOPLE: NearbyPerson[] = [
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
	},
];

const EVENTS: NearbyEvent[] = [
	{
		id: "startup-founders",
		title: "Startup Founders Meeting",
		venue: "Celeb Space",
		priceMinor: 5000,
		currencySymbol: "₦",
		photo: require("@/assets/onboarding/card-back-left.jpg"),
	},
	{
		id: "creative-sketch",
		title: "Creative Sketch Session",
		venue: "Celeb Space",
		priceMinor: 2500,
		currencySymbol: "₦",
		photo: require("@/assets/onboarding/card-back-right.jpg"),
	},
	{
		id: "sunset-run",
		title: "Sunset Run Club",
		venue: "Lekki Foreshore",
		priceMinor: 0,
		currencySymbol: "₦",
		photo: require("@/assets/onboarding/card-front.jpg"),
	},
];

export async function sendConnectionRequest(_personId: string): Promise<void> {
	await delay(MOCK_LATENCY_MS);
}

export async function fetchHomeFeed(): Promise<HomeFeed> {
	await delay(MOCK_LATENCY_MS);

	return {
		avatar: require("@/assets/onboarding/avatar-5.png"),
		isOnline: true,
		place: "Lagos, Ikeja",
		unreadCount: 3,
		matchCount: 18,
		people: PEOPLE,
		events: EVENTS,
	};
}
