import type { ImageSourcePropType } from "react-native";

/**
 * Shape the visited-places endpoint is expected to return. A visit record needs
 * a meetups or check-ins table, neither of which exists, so the screen reads
 * the fixture below.
 *
 * When the endpoint lands: add the zod schema beside the others in
 * `lib/api/`, point `useVisitedPlaces()` at it, and delete `VISITED_PLACES`
 * together with `assets/connections/fixtures/place-*.jpg`. Nothing in
 * `visited-place-card.tsx` should need to change.
 */
export type VisitedPlace = {
	id: string;
	name: string;
	address: string;
	photo: ImageSourcePropType;
	rating: number;
	visitCount: number;
	lastVisitedLabel: string;
	/** Whether the place has earned the "Highly Secure" tag. */
	isHighlySecure: boolean;
};

export const VISITED_PLACES: VisitedPlace[] = [
	{
		id: "cafe-bloom",
		name: "Cafe Bloom",
		address: "124 Bolade St, Iyanpaja, Lagos",
		photo: require("@/assets/connections/fixtures/place-cafe-bloom.jpg"),
		rating: 4.7,
		visitCount: 6,
		lastVisitedLabel: "Today, 9:45 AM",
		isHighlySecure: true,
	},
	{
		id: "freedom-park",
		name: "Freedom Park",
		address: "56 Anthony Road, Lagos",
		photo: require("@/assets/connections/fixtures/place-freedom-park.jpg"),
		rating: 4.7,
		visitCount: 4,
		lastVisitedLabel: "Yesterday, 9:45 AM",
		isHighlySecure: true,
	},
	{
		id: "tech-hub",
		name: "Tech Hub",
		address: "14 Johnson Close, Yaba, Lagos",
		photo: require("@/assets/connections/fixtures/place-tech-hub.jpg"),
		rating: 4.7,
		visitCount: 1,
		lastVisitedLabel: "2 weeks ago, 9:45 AM",
		isHighlySecure: true,
	},
];
