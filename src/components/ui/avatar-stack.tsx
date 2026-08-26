import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { Brand, Ink, Type } from "@/constants/theme";

const SIZE = 28;
const RING = 2;
const OVERLAP = 10;

export type AvatarStackProps = {
	avatars: ImageSourcePropType[];
	extraCount?: number;
	accessibilityLabel: string;
};

/** Overlapping attendee faces closed by a "+N" disc. */
export function AvatarStack({ avatars, extraCount = 0, accessibilityLabel }: AvatarStackProps) {
	return (
		<View accessibilityLabel={accessibilityLabel} style={styles.row}>
			{avatars.map((avatar, index) => (
				<Image
					accessibilityIgnoresInvertColors
					contentFit="cover"
					// Avatars are positional, and the same face can legitimately repeat
					// in a stack, so the index is the only stable key available.
					key={index}
					source={avatar}
					style={[styles.avatar, index > 0 && { marginLeft: -OVERLAP }]}
				/>
			))}

			{extraCount > 0 ? (
				<View
					style={[
						styles.avatar,
						styles.extra,
						avatars.length > 0 && { marginLeft: -OVERLAP },
					]}
				>
					<Text style={styles.extraLabel}>+{extraCount}</Text>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		width: SIZE,
		height: SIZE,
		borderRadius: SIZE / 2,
		borderWidth: RING,
		borderColor: Ink.surface,
		backgroundColor: Ink.border,
	},
	extra: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purple,
	},
	extraLabel: {
		...Type.badgeLabel,
		color: Brand.onBrand,
	},
});
