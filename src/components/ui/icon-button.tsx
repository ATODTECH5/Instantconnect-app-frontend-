import type { FC } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Brand, Ink, MinTapTarget, Radius } from "@/constants/theme";

const DEFAULT_SIZE = 44;
const DEFAULT_ICON_SIZE = 20;
const BADGE_SIZE = 8;
const BADGE_RING = 1.5;

export type IconButtonTone = "surface" | "brand";

export type IconButtonProps = {
	Icon: FC<SvgProps>;
	accessibilityLabel: string;
	onPress: () => void;
	tone?: IconButtonTone;
	width?: number;
	height?: number;
	radius?: number;
	iconSize?: number;
	badgeCount?: number;
	accessibilityHint?: string;
	style?: StyleProp<ViewStyle>;
};

function hitSlopFor(width: number, height: number) {
	return {
		left: Math.max(0, (MinTapTarget - width) / 2),
		right: Math.max(0, (MinTapTarget - width) / 2),
		top: Math.max(0, (MinTapTarget - height) / 2),
		bottom: Math.max(0, (MinTapTarget - height) / 2),
	};
}

export function IconButton({
	Icon,
	accessibilityLabel,
	onPress,
	tone = "surface",
	width = DEFAULT_SIZE,
	height = DEFAULT_SIZE,
	radius = Radius.control,
	iconSize = DEFAULT_ICON_SIZE,
	badgeCount = 0,
	accessibilityHint,
	style,
}: IconButtonProps) {
	const isBrand = tone === "brand";
	const label =
		badgeCount > 0 ? `${accessibilityLabel}, ${badgeCount} unread` : accessibilityLabel;

	return (
		<Pressable
			accessibilityHint={accessibilityHint}
			accessibilityLabel={label}
			accessibilityRole="button"
			hitSlop={hitSlopFor(width, height)}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				{ width, height, borderRadius: radius },
				isBrand ? styles.brand : styles.surface,
				pressed && styles.pressed,
				style,
			]}
		>
			<Icon color={isBrand ? Brand.onBrand : Ink.title} height={iconSize} width={iconSize} />

			{badgeCount > 0 ? <View style={styles.badge} /> : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		alignItems: "center",
		justifyContent: "center",
	},
	surface: {
		backgroundColor: Ink.keypad,
	},
	brand: {
		backgroundColor: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
	badge: {
		position: "absolute",
		top: BADGE_RING,
		right: BADGE_RING,
		width: BADGE_SIZE,
		height: BADGE_SIZE,
		borderRadius: BADGE_SIZE / 2,
		backgroundColor: Ink.badge,
		borderWidth: BADGE_RING,
		borderColor: Ink.badgeRing,
	},
});
