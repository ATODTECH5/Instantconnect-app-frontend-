import { Image } from "expo-image";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import Svg, {
	Circle,
	Defs,
	G,
	LinearGradient,
	Path,
	Stop,
	type NumberProp,
} from "react-native-svg";

import WorldMap from "@/assets/onboarding/world-map.svg";
import { Brand, Ink } from "@/constants/theme";

export const ORBIT_FRAME = { width: 338, height: 251 } as const;

const CENTER = { x: 178.5, y: 122.561 } as const;
/** Where this illustration sits inside the 393x852 design frame. */
const FRAME_ORIGIN = { x: 27, y: 220.939 } as const;
const LOOP_DURATION = 10000;

const RING_DASH = [4.24, 4.24];
const RING_STROKE_WIDTH = 2.12227;

/** Brand gradient stops, reused for both ring strokes. */
const RING_STOPS = [
	{ offset: 0.227215, color: Brand.orange },
	{ offset: 0.30792, color: Brand.coral },
	{ offset: 0.413819, color: Brand.rose },
	{ offset: 0.492025, color: Brand.pink },
	{ offset: 0.633844, color: Brand.magenta },
	{ offset: 0.862489, color: Brand.violet },
	{ offset: 0.92, color: Brand.purple },
];

type Avatar = {
	source: number;
	size: number;
	borderWidth: number;
	radius: number;
	angle: number;
	imageHeight: number;
	imageTop: number;
	/** Fraction of the loop where this avatar starts its single revolution. */
	start: number;
};

/**
 * Radius and angle are the polar form of each avatar's resting position
 * relative to CENTER, recovered from the export's absolute rects. `imageTop`
 * and `imageHeight` reproduce the crop Figma expressed as a pattern transform.
 */
const AVATARS: Avatar[] = [
	{
		source: require("@/assets/onboarding/avatar-1.jpg"),
		size: 57.75,
		borderWidth: 2.75,
		radius: 115.74,
		angle: -170.05,
		imageHeight: 86.44,
		imageTop: -24.85,
		start: 0,
	},
	{
		source: require("@/assets/onboarding/avatar-2.jpg"),
		size: 33.5,
		borderWidth: 1.5,
		radius: 88.54,
		angle: -88.38,
		imageHeight: 50.14,
		imageTop: -0.459,
		start: 0.05,
	},
	{
		source: require("@/assets/onboarding/avatar-3.jpg"),
		size: 57.75,
		borderWidth: 2.75,
		radius: 93.02,
		angle: -1.23,
		imageHeight: 86.63,
		imageTop: -14.44,
		start: 0.1,
	},
	{
		source: require("@/assets/onboarding/avatar-4.jpg"),
		size: 33.5,
		borderWidth: 1.5,
		radius: 117.69,
		angle: 69.87,
		imageHeight: 50.25,
		imageTop: -0.238,
		start: 0.15,
	},
	{
		source: require("@/assets/onboarding/avatar-5.png"),
		size: 25.5,
		borderWidth: 1.5,
		radius: 90.34,
		angle: 141.28,
		imageHeight: 25.5,
		imageTop: 0,
		start: 0.2,
	},
];

/** Each revolution spans 80% of the loop, leaving the rest as a rest beat. */
const REVOLUTION_SPAN = 0.8;

/**
 * Five blinks on a 1.5s cycle, then the pin holds solid for the rest of the
 * loop. Times are loop fractions taken straight from the Figma keyframes.
 */
const PIN_TIMES = [0, 0.0525, 0.0975, 0.15, 1];
const PIN_OPACITIES = [1, 0.15, 1, 1, 1];
const PIN_BLINKS = 5;
const PIN_CYCLE = 0.15;

const pinInput: number[] = [];
const pinOutput: number[] = [];
for (let blink = 0; blink < PIN_BLINKS; blink += 1) {
	const offset = blink * PIN_CYCLE;
	for (let i = 0; i < 4; i += 1) {
		pinInput.push(offset + PIN_TIMES[i]);
		pinOutput.push(PIN_OPACITIES[i]);
	}
}
pinInput.push(1);
pinOutput.push(1);

function AvatarOrbit({ avatar, progress }: { avatar: Avatar; progress: { value: number } }) {
	const { size, borderWidth, radius, angle, start, imageHeight, imageTop, source } = avatar;

	const animatedStyle = useAnimatedStyle(() => {
		const swept = interpolate(
			progress.value,
			[start, start + REVOLUTION_SPAN],
			[0, 360],
			"clamp",
		);
		const heading = `${angle + swept}deg`;
		// Rotate out to the orbit position, then unwind so the face stays upright.
		return {
			transform: [{ rotate: heading }, { translateX: radius }, { rotate: `-${heading}` }],
		};
	});

	return (
		<Animated.View
			style={[
				styles.avatar,
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					borderWidth,
					left: CENTER.x - size / 2,
					top: CENTER.y - size / 2,
				},
				animatedStyle,
			]}
		>
			<Image
				source={source}
				style={{ width: size - borderWidth * 2, height: imageHeight, marginTop: imageTop }}
				contentFit="fill"
			/>
		</Animated.View>
	);
}

function Ring({
	radius,
	gradientId,
	x1,
	y1,
	x2,
	y2,
}: { radius: number; gradientId: string } & {
	x1: NumberProp;
	y1: NumberProp;
	x2: NumberProp;
	y2: NumberProp;
}) {
	return (
		<>
			<Defs>
				<LinearGradient
					id={gradientId}
					gradientUnits="userSpaceOnUse"
					x1={x1}
					y1={y1}
					x2={x2}
					y2={y2}
				>
					{RING_STOPS.map((stop) => (
						<Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
					))}
				</LinearGradient>
			</Defs>
			<Circle
				cx={CENTER.x}
				cy={CENTER.y}
				r={radius}
				fill="none"
				stroke={`url(#${gradientId})`}
				strokeWidth={RING_STROKE_WIDTH}
				strokeLinecap="round"
				strokeDasharray={RING_DASH}
			/>
		</>
	);
}

export function OrbitIllustration() {
	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = withRepeat(
			withTiming(1, { duration: LOOP_DURATION, easing: Easing.linear }),
			-1,
			false,
		);
	}, [progress]);

	const pinStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, pinInput, pinOutput, "clamp"),
	}));

	return (
		<View style={styles.frame}>
			<WorldMap width={337.6} height={212.9} style={styles.map} />

			<Svg
				width={ORBIT_FRAME.width}
				height={ORBIT_FRAME.height}
				style={StyleSheet.absoluteFill}
			>
				<Ring
					radius={121.5}
					gradientId="ringOuter"
					x1={533.4}
					y1={252.2}
					x2={67.5}
					y2={-123.9}
				/>
				<Ring radius={88.5} gradientId="ringInner" x1={437} y1={217} x2={97.7} y2={-57} />
				<Circle cx={127.5} cy={11.561} r={3.5} fill={Brand.purpleLight} />
				<Circle cx={269.942} cy={202.003} r={3.5} fill={Brand.purple} />
				{/* Bubble paths keep the export's absolute coordinates, shifted into frame space. */}
				<G transform={`translate(${-FRAME_ORIGIN.x} ${-FRAME_ORIGIN.y})`}>
					<Path
						d="M127.002 269.553C129.698 269.35 132.407 269.363 135.101 269.593L136.725 269.731C137.321 269.782 137.882 270.032 138.319 270.44C138.756 270.849 139.042 271.392 139.133 271.983L139.235 272.652C139.582 274.92 139.55 277.23 139.139 279.487C139.041 280.027 138.757 280.515 138.335 280.867C137.914 281.218 137.383 281.411 136.834 281.41H127.858C127.651 281.41 127.448 281.461 127.266 281.559L123.355 283.661C123.241 283.722 123.112 283.753 122.983 283.75C122.853 283.747 122.726 283.711 122.615 283.644C122.504 283.577 122.411 283.483 122.348 283.37C122.284 283.257 122.25 283.13 122.25 283V274.483C122.25 273.24 122.72 272.043 123.566 271.131C124.411 270.22 125.569 269.662 126.809 269.568L127.002 269.553ZM127 274.5C126.668 274.5 126.351 274.632 126.116 274.866C125.882 275.101 125.75 275.418 125.75 275.75C125.75 276.082 125.882 276.399 126.116 276.634C126.351 276.868 126.668 277 127 277C127.332 277 127.649 276.868 127.884 276.634C128.118 276.399 128.25 276.082 128.25 275.75C128.25 275.418 128.118 275.101 127.884 274.866C127.649 274.632 127.332 274.5 127 274.5ZM131 274.5C130.668 274.5 130.351 274.632 130.116 274.866C129.882 275.101 129.75 275.418 129.75 275.75C129.75 276.082 129.882 276.399 130.116 276.634C130.351 276.868 130.668 277 131 277C131.332 277 131.649 276.868 131.884 276.634C132.118 276.399 132.25 276.082 132.25 275.75C132.25 275.418 132.118 275.101 131.884 274.866C131.649 274.632 131.332 274.5 131 274.5ZM133.75 275.75C133.75 275.418 133.882 275.101 134.116 274.866C134.351 274.632 134.668 274.5 135 274.5C135.332 274.5 135.649 274.632 135.884 274.866C136.118 275.101 136.25 275.418 136.25 275.75C136.25 276.082 136.118 276.399 135.884 276.634C135.649 276.868 135.332 277 135 277C134.668 277 134.351 276.868 134.116 276.634C133.882 276.399 133.75 276.082 133.75 275.75Z"
						fill={Brand.purple}
					/>
					<Path
						d="M293 248C293 253.799 287.627 258.5 281 258.5C278.87 258.509 276.769 258.005 274.875 257.03L269 258.5L271.007 253.816C269.74 252.151 269 250.151 269 248C269 242.201 274.373 237.5 281 237.5C287.627 237.5 293 242.201 293 248ZM276.5 246.5H273.5V249.5H276.5V246.5ZM288.5 246.5H285.5V249.5H288.5V246.5ZM279.5 246.5H282.5V249.5H279.5V246.5Z"
						fill={Brand.purple}
					/>
				</G>
			</Svg>

			{AVATARS.map((avatar) => (
				<AvatarOrbit key={avatar.angle} avatar={avatar} progress={progress} />
			))}

			<Animated.View style={[styles.pin, pinStyle]}>
				<Svg width={49} height={49} viewBox="181 319 49 49">
					<Circle cx={205.5} cy={343.5} r={24.5} fill={Ink.surface} />
					<Path
						d="M205.5 342.979C204.809 342.979 204.147 342.705 203.659 342.216C203.17 341.728 202.896 341.066 202.896 340.375C202.896 339.684 203.17 339.022 203.659 338.534C204.147 338.045 204.809 337.771 205.5 337.771C206.191 337.771 206.853 338.045 207.341 338.534C207.83 339.022 208.104 339.684 208.104 340.375C208.104 340.717 208.037 341.056 207.906 341.372C207.775 341.688 207.583 341.975 207.341 342.216C207.1 342.458 206.813 342.65 206.497 342.781C206.181 342.912 205.842 342.979 205.5 342.979ZM205.5 333.083C203.566 333.083 201.711 333.852 200.344 335.219C198.977 336.586 198.208 338.441 198.208 340.375C198.208 345.844 205.5 353.917 205.5 353.917C205.5 353.917 212.792 345.844 212.792 340.375C212.792 338.441 212.023 336.586 210.656 335.219C209.289 333.852 207.434 333.083 205.5 333.083Z"
						fill={Brand.purple}
					/>
				</Svg>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	frame: {
		width: ORBIT_FRAME.width,
		height: ORBIT_FRAME.height,
	},
	map: {
		position: "absolute",
		left: 0,
		top: 31.06,
	},
	avatar: {
		position: "absolute",
		borderColor: Ink.surface,
		backgroundColor: "#D4AFBD",
		overflow: "hidden",
	},
	pin: {
		position: "absolute",
		left: CENTER.x - 24.5,
		top: CENTER.y - 24.5,
		width: 49,
		height: 49,
	},
});
