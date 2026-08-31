import type { ImageSourcePropType } from "react-native";

export type NearbyEvent = {
	id: string;
	title: string;
	venue: string;
	priceMinor: number;
	currencySymbol: string;
	photo: ImageSourcePropType;
};

/**
 * Events are the last part of this screen with no endpoint behind them: there
 * is no events table yet, so these stay a stand-in rather than an empty rail
 * that would read as a bug. Delete this list the moment the events module
 * lands; nothing else on Home is mocked any more.
 */
export const EVENTS: NearbyEvent[] = [
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
