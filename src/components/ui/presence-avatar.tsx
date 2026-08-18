import { Image } from "expo-image";
import { StyleSheet, View, type ImageSourcePropType } from "react-native";

import { Ink } from "@/constants/theme";

const DOT_RATIO = 0.325;
const RING_WIDTH = 2;

export type PresenceAvatarProps = {
	source: ImageSourcePropType;
	size: number;
	isOnline?: boolean;
	accessibilityLabel?: string;
};

export function PresenceAvatar({
	source,
	size,
	isOnline = false,
	accessibilityLabel,
}: PresenceAvatarProps) {
	const dotSize = Math.round(size * DOT_RATIO);

	return (
		<View style={{ width: size, height: size }}>
			<Image
				accessibilityIgnoresInvertColors
				accessible={accessibilityLabel !== undefined}
				alt={accessibilityLabel}
				contentFit="cover"
				source={source}
				style={[styles.photo, { borderRadius: size / 2 }]}
			/>

			{isOnline ? (
				<View
					style={[
						styles.dot,
						{ width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
					]}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	photo: {
		width: "100%",
		height: "100%",
		backgroundColor: Ink.border,
	},
	dot: {
		position: "absolute",
		right: 0,
		bottom: 0,
		backgroundColor: Ink.online,
		borderWidth: RING_WIDTH,
		borderColor: Ink.surface,
	},
});
