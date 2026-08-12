import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { BrandWordmark } from "@/components/brand-wordmark";
import { GradientBackground } from "@/components/gradient-background";
import { useDesignScale } from "@/hooks/use-design-scale";

const HOLD_DURATION = 900;
const FADE_DURATION = 400;

const WORDMARK = { fontSize: 24, lineHeight: 32 } as const;

type BrandSplashProps = {
	onFinish: () => void;
};

export function BrandSplash({ onFinish }: BrandSplashProps) {
	const opacity = useSharedValue(1);
	const { horizontal } = useDesignScale();

	useEffect(() => {
		opacity.value = withDelay(
			HOLD_DURATION,
			withTiming(0, { duration: FADE_DURATION }, (finished) => {
				"worklet";
				if (finished) scheduleOnRN(onFinish);
			}),
		);
	}, [opacity, onFinish]);

	const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

	return (
		<Animated.View accessibilityViewIsModal style={[styles.container, animatedStyle]}>
			<GradientBackground style={StyleSheet.absoluteFill} />
			<BrandWordmark
				style={{
					fontSize: WORDMARK.fontSize * horizontal,
					lineHeight: WORDMARK.lineHeight * horizontal,
				}}
			/>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFill,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 1000,
	},
});
