import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import UsersIcon from "@/assets/home/cat-friendship.svg";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const ICON_DISC = 36;
const ICON = 18;

export type CircleRowProps = {
	name: string;
	subtitle: string;
	onPress?: () => void;
	selected?: boolean;
	disabled?: boolean;
	trailing?: ReactNode;
	accessibilityHint?: string;
};

/** The Safety Dispatch frame's row, shared with the circle manager so both read as one feature. */
export function CircleRow({
	name,
	subtitle,
	onPress,
	selected = false,
	disabled = false,
	trailing,
	accessibilityHint,
}: CircleRowProps) {
	return (
		<Pressable
			accessibilityHint={accessibilityHint}
			accessibilityLabel={`${name}, ${subtitle}`}
			accessibilityRole={onPress ? (selected !== undefined ? "checkbox" : "button") : undefined}
			accessibilityState={{ checked: selected, disabled }}
			disabled={disabled || !onPress}
			onPress={onPress}
			style={({ pressed }) => [
				styles.row,
				selected && styles.rowSelected,
				pressed && onPress && styles.pressed,
			]}
		>
			<View style={styles.disc}>
				<UsersIcon color={Brand.purple} height={ICON} width={ICON} />
			</View>
			<View style={styles.text}>
				<Text numberOfLines={1} style={styles.name}>
					{name}
				</Text>
				<Text numberOfLines={1} style={styles.subtitle}>
					{subtitle}
				</Text>
			</View>
			{trailing}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget,
		padding: Spacing.three,
		borderRadius: Radius.media,
		borderWidth: 1,
		borderColor: "transparent",
		backgroundColor: Ink.bubbleIncoming,
	},
	rowSelected: {
		borderColor: Brand.purple,
		backgroundColor: Brand.purpleSurface,
	},
	disc: {
		width: ICON_DISC,
		height: ICON_DISC,
		borderRadius: Radius.pill,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	text: {
		flex: 1,
		gap: Spacing.half,
	},
	name: {
		...Type.cardName,
		fontSize: 15,
		lineHeight: 20,
		color: Ink.title,
	},
	subtitle: {
		...Type.cardMeta,
		color: Ink.muted,
	},
	pressed: {
		opacity: 0.8,
	},
});
