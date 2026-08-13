import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { StyleSheet, View } from "react-native";

import { Ink, Radius } from "@/constants/theme";

const TRACK_WIDTH = 4;
const MIN_THUMB_HEIGHT = 24;

export type ScrollIndicatorProps = {
	/** Current scroll offset, driven from an `useAnimatedScrollHandler`. */
	offset: SharedValue<number>;
	/** Height of the scrollable content. */
	contentHeight: SharedValue<number>;
	/** Height of the visible scroll viewport. */
	viewportHeight: SharedValue<number>;
};

/**
 * The design calls for a visible track with a dark thumb, which the platform
 * scroll indicator cannot be styled into, so it is drawn here instead.
 */
export function ScrollIndicator({ offset, contentHeight, viewportHeight }: ScrollIndicatorProps) {
	const thumbStyle = useAnimatedStyle(() => {
		const track = viewportHeight.value;
		const content = contentHeight.value;

		if (track <= 0 || content <= track) return { height: 0, opacity: 0 };

		const height = Math.max((track / content) * track, MIN_THUMB_HEIGHT);
		const scrollable = content - track;
		const progress = Math.min(Math.max(offset.value / scrollable, 0), 1);

		return {
			height,
			opacity: 1,
			transform: [{ translateY: progress * (track - height) }],
		};
	});

	return (
		<View pointerEvents="none" style={styles.track}>
			<Animated.View style={[styles.thumb, thumbStyle]} />
		</View>
	);
}

const styles = StyleSheet.create({
	track: {
		position: "absolute",
		top: 0,
		bottom: 0,
		right: 0,
		width: TRACK_WIDTH,
		borderRadius: TRACK_WIDTH / 2,
		backgroundColor: Ink.scrollTrack,
		overflow: "hidden",
	},
	thumb: {
		width: TRACK_WIDTH,
		borderRadius: Radius.checkbox,
		backgroundColor: Ink.body,
	},
});
