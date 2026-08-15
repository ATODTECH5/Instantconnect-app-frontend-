import { useEffect } from "react";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { BrandGradientStops } from "@/constants/theme";

const DEFAULT_SIZE = 36;
const SPIN_DURATION = 1100;

/** The artboard draws a 4pt ring at 36 and a 2pt ring at 18. */
const STROKE_RATIO = 9;

export function GradientSpinner({ size = DEFAULT_SIZE }: { size?: number }) {
	const rotation = useSharedValue(0);

	useEffect(() => {
		rotation.value = withRepeat(
			withTiming(360, { duration: SPIN_DURATION, easing: Easing.linear }),
			-1,
			false,
		);
	}, [rotation]);

	const spinStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}));

	const strokeWidth = size / STROKE_RATIO;
	const radius = (size - strokeWidth) / 2;

	return (
		<Animated.View accessibilityRole="progressbar" style={spinStyle}>
			<Svg height={size} width={size}>
				<Defs>
					<LinearGradient
						gradientUnits="userSpaceOnUse"
						id="spinner"
						x1={size}
						y1={size}
						x2="0"
						y2="0"
					>
						{BrandGradientStops.map(({ offset, color }) => (
							<Stop key={color} offset={offset} stopColor={color} />
						))}
					</LinearGradient>
				</Defs>

				<Circle
					cx={size / 2}
					cy={size / 2}
					fill="none"
					r={radius}
					stroke="url(#spinner)"
					strokeWidth={strokeWidth}
				/>
			</Svg>
		</Animated.View>
	);
}
