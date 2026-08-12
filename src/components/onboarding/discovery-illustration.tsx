import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

import AiCard from "@/assets/onboarding/ai-card.svg";
import CatBusiness from "@/assets/onboarding/cat-business.svg";
import CatCommunity from "@/assets/onboarding/cat-community.svg";
import CatFriendship from "@/assets/onboarding/cat-friendship.svg";
import CatSocial from "@/assets/onboarding/cat-social.svg";
import CatTalents from "@/assets/onboarding/cat-talents.svg";
import PhoneMap from "@/assets/onboarding/phone-map.svg";

/**
 * The export fades the handset out at design y 465 rather than cropping it, so
 * the frame stops there and the artwork below is clipped behind a short fade.
 */
export const DISCOVERY_FRAME = { width: 304, height: 300 } as const;

/**
 * Every offset below is the artwork's own position in the 393x852 frame,
 * shifted so the leftmost and topmost pieces sit at the frame origin.
 */
const PHONE = { left: 79.6, top: 63, width: 145.8, height: 297 };
const CARD = { left: 0, top: 150, width: 303, height: 153 };

const CATEGORIES = [
	{ key: "friendship", Art: CatFriendship, left: 132, top: 0, width: 49, height: 52 },
	{ key: "business", Art: CatBusiness, left: 34, top: 19, width: 42, height: 51 },
	{ key: "social", Art: CatSocial, left: 240, top: 19, width: 37, height: 51 },
	{ key: "talents", Art: CatTalents, left: 1, top: 99, width: 37, height: 51 },
	{ key: "community", Art: CatCommunity, left: 249, top: 99, width: 55, height: 53 },
];

const FADE_HEIGHT = 14;

/** react-native-web reads the CSS property, native reads the RN style prop. */
const FADE_IMAGE = "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)";
const FADE_GRADIENT = Platform.select({
	web: { backgroundImage: FADE_IMAGE } as ViewStyle,
	default: { experimental_backgroundImage: FADE_IMAGE } satisfies ViewStyle,
});

export function DiscoveryIllustration() {
	return (
		<View
			style={styles.frame}
			accessibilityRole="image"
			accessibilityLabel="A map with nearby meetup spots, surrounded by the Business, Friendship, Social, Talents and Community categories"
		>
			<PhoneMap
				width={PHONE.width}
				height={PHONE.height}
				style={[styles.piece, { left: PHONE.left, top: PHONE.top }]}
			/>

			<View style={styles.fade} />

			<AiCard
				width={CARD.width}
				height={CARD.height}
				style={[styles.piece, { left: CARD.left, top: CARD.top }]}
			/>

			{CATEGORIES.map(({ key, Art, left, top, width, height }) => (
				<Art
					key={key}
					width={width}
					height={height}
					style={[styles.piece, { left, top }]}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	frame: {
		width: DISCOVERY_FRAME.width,
		height: DISCOVERY_FRAME.height,
		overflow: "hidden",
	},
	piece: {
		position: "absolute",
	},
	fade: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: FADE_HEIGHT,
		zIndex: 1,
		...FADE_GRADIENT,
	},
});
