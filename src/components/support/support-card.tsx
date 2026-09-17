import type { FC, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import ChevronRightIcon from "@/assets/support/chevron-right.svg";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const TRAILING_ICON = 16;
const ICON_BOX = 40;
const ICON = 20;

/** The white, softly shadowed card the Help & Support hub stacks its rows in. */
export function SupportCard({ children }: { children: ReactNode }) {
	return <View style={styles.card}>{children}</View>;
}

export type SupportLinkRowProps = {
	label: string;
	Icon: FC<SvgProps>;
	onPress: () => void;
	isLast?: boolean;
};

/** "Help", "Messages", "Live Chat": a label with a small filled glyph on the right. */
export function SupportLinkRow({ label, Icon, onPress, isLast = false }: SupportLinkRowProps) {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [styles.row, !isLast && styles.divided, pressed && styles.pressed]}
		>
			<Text style={styles.label}>{label}</Text>
			<Icon color={Brand.purple} height={TRAILING_ICON} width={TRAILING_ICON} />
		</Pressable>
	);
}

export type ContactRowProps = {
	caption: string;
	value: string;
	Icon: FC<SvgProps>;
	onPress: () => void;
	isLast?: boolean;
};

/** "Email Support", "WhatsApp Chat", "Call Hotline": an outlined icon box, two lines and a chevron. */
export function ContactRow({ caption, value, Icon, onPress, isLast = false }: ContactRowProps) {
	return (
		<Pressable
			accessibilityHint="Opens outside the app"
			accessibilityLabel={`${caption}, ${value}`}
			accessibilityRole="link"
			onPress={onPress}
			style={({ pressed }) => [
				styles.row,
				styles.contactRow,
				!isLast && styles.divided,
				pressed && styles.pressed,
			]}
		>
			<View style={styles.iconBox}>
				<Icon color={Brand.purple} height={ICON} width={ICON} />
			</View>

			<View style={styles.text}>
				<Text style={styles.caption}>{caption}</Text>
				<Text style={styles.value}>{value}</Text>
			</View>

			<ChevronRightIcon color={Ink.meta} height={TRAILING_ICON} width={TRAILING_ICON} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		paddingHorizontal: 14,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.surface,
		shadowColor: Ink.title,
		shadowOpacity: 0.1,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 0 },
		elevation: 3,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		minHeight: MinTapTarget,
		paddingVertical: Gap.card,
	},
	contactRow: {
		gap: Gap.snug,
	},
	divided: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Ink.border,
	},
	label: {
		...Type.action,
		color: Ink.body,
	},
	iconBox: {
		width: ICON_BOX,
		height: ICON_BOX,
		borderRadius: Gap.snug,
		borderWidth: 0.5,
		borderColor: Brand.purpleTint,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surface,
	},
	text: {
		flex: 1,
		gap: Spacing.half,
	},
	caption: {
		...Type.fieldLabel,
		color: Ink.meta,
	},
	value: {
		...Type.docSection,
		color: Ink.body,
	},
	pressed: {
		opacity: 0.6,
	},
});
