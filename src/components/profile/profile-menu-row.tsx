import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import ChevronRightIcon from "@/assets/profile/chevron-right.svg";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 24;
const CHEVRON_SIZE = 20;

export type ProfileMenuRowProps = {
	Icon: FC<SvgProps>;
	label: string;
	onPress: () => void;
	/** Small status pill, such as KYC's "Pending". */
	badge?: { label: string; tone: "pending" } | null;
	isLast?: boolean;
	tone?: "default" | "danger";
};

export function ProfileMenuRow({
	Icon,
	label,
	onPress,
	badge = null,
	isLast = false,
	tone = "default",
}: ProfileMenuRowProps) {
	const isDanger = tone === "danger";
	const accent = isDanger ? Ink.danger : Brand.purple;

	return (
		<Pressable
			accessibilityLabel={badge ? `${label}, ${badge.label}` : label}
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

			{badge ? (
				<View style={styles.badge}>
					<Text style={styles.badgeLabel}>{badge.label}</Text>
				</View>
			) : null}

			<ChevronRightIcon
				color={Ink.placeholder}
				height={CHEVRON_SIZE}
				width={CHEVRON_SIZE}
			/>
		</Pressable>
	);
}

/** Rows are grouped into cards on the artboard rather than running as one list. */
export function ProfileMenuGroup({ children }: { children: React.ReactNode }) {
	return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
	group: {
		borderRadius: Radius.media,
		backgroundColor: Ink.keypad,
		overflow: "hidden",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget + Spacing.two,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
	},
	divided: {
		borderBottomWidth: 1,
		borderBottomColor: Ink.rowBorder,
	},
	label: {
		...Type.menuLabel,
		flex: 1,
		color: Ink.title,
	},
	dangerLabel: {
		color: Ink.danger,
	},
	badge: {
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.one,
		borderRadius: Radius.pill,
		backgroundColor: Ink.pendingSurface,
	},
	badgeLabel: {
		...Type.badgeLabel,
		color: Ink.pending,
	},
	pressed: {
		opacity: 0.6,
	},
});
