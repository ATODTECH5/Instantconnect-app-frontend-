import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 20;

export type ContactCardProps = {
	Icon: FC<SvgProps>;
	title: string;
	caption: string;
	value: string;
	actionLabel: string;
	onPressAction: () => void;
	isVerified: boolean;
};

/** The Email Address / Phone Number cards on Email & Phone Number. */
export function ContactCard({
	Icon,
	title,
	caption,
	value,
	actionLabel,
	onPressAction,
	isVerified,
}: ContactCardProps) {
	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<View style={styles.titleGroup}>
					<Icon color={Brand.purple} height={ICON_SIZE} width={ICON_SIZE} />

					<Text style={styles.title}>{title}</Text>
				</View>

				{isVerified ? (
					<View style={styles.badge}>
						<Text style={styles.badgeLabel}>Verified</Text>
					</View>
				) : null}
			</View>

			<View style={styles.body}>
				<Text style={styles.caption}>{caption}</Text>

				<Text style={styles.value}>{value}</Text>
			</View>

			<Pressable
				accessibilityLabel={actionLabel}
				accessibilityRole="button"
				hitSlop={Spacing.two}
				onPress={onPressAction}
				style={({ pressed }) => [styles.action, pressed && styles.pressed]}
			>
				<Text style={styles.actionLabel}>{actionLabel}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Spacing.three - Spacing.half,
		padding: Gap.card,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.keypad,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
	},
	titleGroup: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
	},
	title: {
		...Type.profileMeta,
		fontFamily: Type.cta.fontFamily,
		color: Ink.body,
	},
	badge: {
		paddingHorizontal: Spacing.two - Spacing.half,
		paddingVertical: Spacing.half,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Ink.successBorder,
		borderRadius: Gap.tight,
		backgroundColor: Ink.successSurface,
	},
	badgeLabel: {
		...Type.tagLabel,
		color: Ink.success,
	},
	body: {
		gap: Gap.tight,
	},
	caption: {
		...Type.footnote,
		fontFamily: Type.action.fontFamily,
		color: Ink.meta,
	},
	value: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.body,
	},
	action: {
		alignSelf: "flex-start",
	},
	actionLabel: {
		...Type.profileMeta,
		fontFamily: Type.cta.fontFamily,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.6,
	},
});
