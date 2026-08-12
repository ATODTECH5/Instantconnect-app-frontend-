import { useCallback, useState, type ReactNode } from "react";
import {
	StyleSheet,
	View,
	type LayoutChangeEvent,
	type StyleProp,
	type ViewStyle,
} from "react-native";

type Frame = { width: number; height: number };

type ScaledFrameProps = {
	/** Size the artwork was exported at. */
	frame: Frame;
	children: ReactNode;
	maxScale?: number;
	style?: StyleProp<ViewStyle>;
};

/**
 * Fits fixed size artwork into whatever box the layout hands it. The artwork
 * keeps its exported coordinates and is scaled on the transform instead, so
 * illustrations built from absolute offsets stay intact on every screen size.
 */
export function ScaledFrame({ frame, children, maxScale = 1, style }: ScaledFrameProps) {
	const [box, setBox] = useState<Frame | null>(null);

	const handleLayout = useCallback((event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout;
		setBox((current) =>
			current && current.width === width && current.height === height
				? current
				: { width, height },
		);
	}, []);

	const scale = box ? Math.min(box.width / frame.width, box.height / frame.height, maxScale) : 0;

	return (
		<View style={[styles.box, style]} onLayout={handleLayout}>
			{scale > 0 ? (
				<View style={{ width: frame.width, height: frame.height, transform: [{ scale }] }}>
					{children}
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
});
