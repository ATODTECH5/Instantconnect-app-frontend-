import { Image } from "expo-image";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

import Profile1 from "@/assets/onboarding/Profile1.svg";
import Profile2 from "@/assets/onboarding/Profile2.svg";
import Profile3 from "@/assets/onboarding/Profile3.svg";

export const CARD_STACK_FRAME = { width: 312, height: 279 } as const;

/**
 * Timings measured off the prototype recording: the stack cycles every 7.5s in
 * three even steps, and each step moves for roughly the first 0.95s then holds.
 */
const LOOP_DURATION = 7500;
const STEPS = 3;
const TRANSITION_RATIO = 950 / (LOOP_DURATION / STEPS);

/**
 * The three resting positions, in the order cards travel through them. `z`
 * is the paint order of that position, so whichever card is in the last slot
 * reads as the front of the stack.
 */
const SLOTS = [
	{ x: 88.996, y: 130.769, angle: -1.63081, z: 1 },
	{ x: 210.942, y: 118.23, angle: 8.65673, z: 0 },
	{ x: 160.072, y: 157.648, angle: 4.16705, z: 2 },
];

/**
 * Each export is sized to its own rotated bounding box with the card centred,
 * so a card is placed by its centre and rotated by the difference between the
 * slot's angle and the rotation already baked into the artwork.
 */
const CARDS = [
	{ Artwork: Profile1, width: 178, height: 218, bakedAngle: -1.63081, slot: 0 },
	{ Artwork: Profile3, width: 203, height: 237, bakedAngle: 8.65673, slot: 1 },
	{ Artwork: Profile2, width: 188, height: 225, bakedAngle: 4.16705, slot: 2 },
];

const BADGE = { size: 25.8, inner: 16 } as const;

const BADGES = [
	{ source: require("@/assets/onboarding/badge-1.png"), left: 15.99, top: 14.1 },
	{ source: require("@/assets/onboarding/badge-2.png"), left: 224.99, top: 1.1 },
	{ source: require("@/assets/onboarding/badge-3.png"), left: 2.99, top: 222.1 },
	{ source: require("@/assets/onboarding/badge-4.png"), left: 269.99, top: 191.1 },
	{ source: require("@/assets/onboarding/badge-5.png"), left: 176.99, top: 253.1 },
];

function easeInOut(t: number) {
	"worklet";
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type CardProps = {
	card: (typeof CARDS)[number];
	progress: { value: number };
};

function ShufflingCard({ card, progress }: CardProps) {
	const { Artwork, width, height, bakedAngle, slot } = card;

	const animatedStyle = useAnimatedStyle(() => {
		/**
		 * The driver is a repeating 0 to 1 timing, but the mapper can sample it
		 * outside that range as a repetition wraps. `%` keeps the sign of its left
		 * operand, so folding the raw value into [0, 1) first is what keeps the
		 * slot index in range instead of reaching for SLOTS[-1].
		 */
		const raw = progress.value;
		const cycle = Number.isFinite(raw) ? ((raw % 1) + 1) % 1 : 0;

		const position = cycle * STEPS;
		const step = Math.floor(position);
		const travelled = easeInOut(Math.min((position - step) / TRANSITION_RATIO, 1));

		const from = SLOTS[(slot + step) % STEPS];
		const to = SLOTS[(slot + step + 1) % STEPS];

		return {
			left: from.x + (to.x - from.x) * travelled - width / 2,
			top: from.y + (to.y - from.y) * travelled - height / 2,
			transform: [
				{
					rotate: `${from.angle + (to.angle - from.angle) * travelled - bakedAngle}deg`,
				},
			],
			zIndex: travelled < 0.5 ? from.z : to.z,
		};
	});

	return (
		<Animated.View style={[styles.card, animatedStyle]}>
			<Artwork width={width} height={height} />
		</Animated.View>
	);
}

export function CardStackIllustration() {
	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = withRepeat(
			withTiming(1, { duration: LOOP_DURATION, easing: Easing.linear }),
			-1,
			false,
		);
	}, [progress]);

	return (
		<View style={styles.frame}>
			{CARDS.map((card) => (
				<ShufflingCard key={card.slot} card={card} progress={progress} />
			))}

			{BADGES.map((badge) => (
				<View key={badge.left} style={[styles.badge, { left: badge.left, top: badge.top }]}>
					<Image source={badge.source} style={styles.badgeEmoji} contentFit="contain" />
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	frame: {
		width: CARD_STACK_FRAME.width,
		height: CARD_STACK_FRAME.height,
	},
	card: {
		position: "absolute",
	},
	badge: {
		position: "absolute",
		width: BADGE.size,
		height: BADGE.size,
		borderRadius: BADGE.size / 2,
		backgroundColor: "#D9D9D9",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 3,
	},
	badgeEmoji: {
		width: BADGE.inner,
		height: BADGE.inner,
	},
});
