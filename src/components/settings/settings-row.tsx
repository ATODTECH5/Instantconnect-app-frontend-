import type { FC, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import ChevronRightIcon from "@/assets/profile/chevron-right.svg";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 20;
const CHEVRON_SIZE = 16;

export type SettingsRowProps = {
	Icon: FC<SvgProps>;
	label: string;
	onPress: () => void;
	isLast?: boolean;
	tone?: "default" | "danger";
};

/**
 * The Settings frames set their rows tighter than the profile menu: a 44pt
 * row, a 20pt icon and a 16pt chevron. `ProfileMenuRow` stays as it is for
 * the profile tab; this is the compact sibling.
 */
export function SettingsRow({
	Icon,
	label,
	onPress,
	isLast = false,
	tone = "default",
}: SettingsRowProps) {
	const isDanger = tone === "danger";
	const accent = isDanger ? Ink.badge : Brand.purple;

	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [
				styles.row,
				!isLast && styles.divided,
				pressed && styles.pressed,
			]}
		>
			<Icon color={accent} height={ICON_SIZE} width={ICON_SIZE} />

			<Text numberOfLines={1} style={[styles.label, isDanger && styles.dangerLabel]}>
				{label}
			</Text>

			<ChevronRightIcon color={Ink.placeholder} height={CHEVRON_SIZE} width={CHEVRON_SIZE} />
		</Pressable>
	);
}

export function SettingsGroup({ children }: { children: ReactNode }) {
	return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
	group: {
		borderRadius: Radius.dialog,
		backgroundColor: Ink.keypad,
		overflow: "hidden",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget - Spacing.one,
		paddingHorizontal: Gap.card,
		paddingVertical: Spacing.two,
	},
	divided: {
		borderBottomWidth: 1,
		borderBottomColor: Ink.bubbleIncoming,
	},
	label: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		flex: 1,
		color: Ink.body,
	},
	dangerLabel: {
		color: Ink.badge,
	},
	pressed: {
		opacity: 0.6,
	},
});
