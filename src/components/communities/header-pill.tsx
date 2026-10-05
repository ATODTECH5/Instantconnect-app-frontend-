import { Pressable, StyleSheet, Text } from "react-native";

import PlusIcon from "@/assets/profile/plus.svg";
import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const ICON = 16;

export type HeaderPillProps = {
	label: string;
	accessibilityHint: string;
	onPress: () => void;
};

/** The "+ Create" and "+ Invite" control at the end of a screen header. */
export function HeaderPill({ label, accessibilityHint, onPress }: HeaderPillProps) {
	return (
		<Pressable
			accessibilityHint={accessibilityHint}
			accessibilityLabel={label}
			accessibilityRole="button"
			hitSlop={Spacing.one}
			onPress={onPress}
			style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
		>
			<PlusIcon color={Brand.purple} height={ICON} width={ICON} />
			<Text style={styles.label}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	pill: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
		minHeight: MinTapTarget - Spacing.one,
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurface,
	},
	label: {
		...Type.cardAction,
		fontSize: 14,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
		backgroundColor: Ink.bubbleIncoming,
	},
});
