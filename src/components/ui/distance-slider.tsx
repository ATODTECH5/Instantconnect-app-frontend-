import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useDerivedValue,
	withSpring,
} from "react-native-reanimated";

import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 22;
const TICK_HEIGHT = 6;
const SPRING = { damping: 18, stiffness: 220 } as const;

export type DistanceSliderProps = {
	steps: readonly number[];
	value: number;
	onChange: (value: number) => void;
	label: string;
};

/**
 * The artboard spaces its 1, 5, 10 and 20 km ticks evenly rather than by value,
 * so this is a discrete slider over the step indices, not a linear kilometre
 * scale. The thumb animates on the UI thread; only the settled index crosses
 * back to JS.
 */
export function DistanceSlider({ steps, value, onChange, label }: DistanceSliderProps) {
	const [trackWidth, setTrackWidth] = useState(0);

	const lastIndex = steps.length - 1;
	const index = Math.max(0, steps.indexOf(value));

	const progress = useDerivedValue(
		() => withSpring(lastIndex === 0 ? 0 : index / lastIndex, SPRING),
		[index, lastIndex],
	);

	const fillStyle = useAnimatedStyle(() => ({
		width: progress.value * trackWidth,
	}));

	const thumbStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: progress.value * trackWidth - THUMB_SIZE / 2 }],
	}));

	const selectNearest = useCallback(
		(x: number) => {
			if (trackWidth <= 0) return;

			const ratio = Math.min(Math.max(x / trackWidth, 0), 1);
			const next = steps[Math.round(ratio * lastIndex)];

			if (next !== undefined && next !== value) onChange(next);
		},
		[lastIndex, onChange, steps, trackWidth, value],
	);

	const pan = Gesture.Pan()
		.onUpdate((event) => runOnJS(selectNearest)(event.x))
		.onEnd((event) => runOnJS(selectNearest)(event.x));

	const step = useCallback(
		(delta: number) => {
			const next = steps[Math.min(Math.max(index + delta, 0), lastIndex)];

			if (next !== undefined && next !== value) onChange(next);
		},
		[index, lastIndex, onChange, steps, value],
	);

	return (
		<View>
			<GestureDetector gesture={pan}>
				<View
					accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
					accessibilityLabel={label}
					accessibilityRole="adjustable"
					accessibilityValue={{
						min: steps[0],
						max: steps[lastIndex],
						now: value,
						text: `${value} kilometres`,
					}}
					onAccessibilityAction={(event) => {
						step(event.nativeEvent.actionName === "increment" ? 1 : -1);
					}}
					onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
					style={styles.hitArea}
				>
					<View style={styles.track}>
						<Animated.View style={[styles.fill, fillStyle]} />
					</View>

					<Animated.View style={[styles.thumb, thumbStyle]} />
				</View>
			</GestureDetector>

			<View style={styles.ticks}>
				{steps.map((stepValue, stepIndex) => (
					<Pressable
						accessibilityLabel={`${stepValue} kilometres`}
						accessibilityRole="button"
						accessibilityState={{ selected: stepValue === value }}
						key={stepValue}
						onPress={() => onChange(stepValue)}
						style={[
							styles.tick,
							stepIndex === 0 && styles.tickFirst,
							stepIndex === lastIndex && styles.tickLast,
						]}
					>
						<View style={styles.tickMark} />

						<Text style={styles.tickLabel}>{stepValue} km</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	hitArea: {
		height: MinTapTarget,
		justifyContent: "center",
	},
	track: {
		height: TRACK_HEIGHT,
		borderRadius: Radius.pill,
		backgroundColor: Ink.trackInactive,
		overflow: "hidden",
	},
	fill: {
		height: TRACK_HEIGHT,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purple,
	},
	thumb: {
		position: "absolute",
		width: THUMB_SIZE,
		height: THUMB_SIZE,
		borderRadius: THUMB_SIZE / 2,
		backgroundColor: Brand.purple,
	},
	ticks: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	tick: {
		alignItems: "center",
		gap: Spacing.one,
		paddingHorizontal: Spacing.one,
	},
	tickFirst: {
		alignItems: "flex-start",
	},
	tickLast: {
		alignItems: "flex-end",
	},
	tickMark: {
		width: 1,
		height: TICK_HEIGHT,
		backgroundColor: Ink.borderStrong,
	},
	tickLabel: {
		...Type.sliderTick,
		color: Ink.meta,
	},
});
