import { memo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const MIN_HEIGHT = 40;

export type ChipProps = {
	label: string;
	selected?: boolean;
	onPress: () => void;
	accessibilityHint?: string;
};

/** Pill used by Popular Searches, the result tabs, and every filter group. */
export const Chip = memo(function Chip({
	label,
	selected = false,
	onPress,
	accessibilityHint,
}: ChipProps) {
	return (
		<Pressable
			accessibilityHint={accessibilityHint}
			accessibilityLabel={label}
			accessibilityRole="button"
			accessibilityState={{ selected }}
			hitSlop={(MinTapTarget - MIN_HEIGHT) / 2}
			onPress={onPress}
			style={({ pressed }) => [
				styles.chip,
				selected ? styles.selected : styles.unselected,
				pressed && styles.pressed,
			]}
		>
			<Text
				numberOfLines={1}
				style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}
			>
				{label}
			</Text>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	chip: {
		minHeight: MIN_HEIGHT,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.three + Spacing.half,
		borderRadius: Radius.pill,
		borderWidth: 1,
	},
	unselected: {
		backgroundColor: Ink.surface,
		borderColor: Ink.border,
	},
	selected: {
		backgroundColor: Brand.purple,
		borderColor: Brand.purple,
	},
	label: {
		textAlign: "center",
	},
	labelUnselected: {
		...Type.chipLabel,
		color: Ink.body,
	},
	labelSelected: {
		...Type.chipLabelSelected,
		color: Brand.onBrand,
	},
	pressed: {
		opacity: 0.7,
	},
});
