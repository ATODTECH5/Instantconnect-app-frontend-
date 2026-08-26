import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import {
	Brand,
	BrandGradient,
	Gap,
	Ink,
	MinTapTarget,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";

const ICON_SIZE = 20;
const ACTION_MIN_HEIGHT = 40;

export type PromoCardProps = {
	Icon: FC<SvgProps>;
	title: string;
	body: string;
	/** Renders an inline button. Without it the whole card is the target. */
	actionLabel?: string;
	onPress: () => void;
	accessibilityHint?: string;
};

/** Gradient promo panel, shared by the home feed and the search idle state. */
export function PromoCard({
	Icon,
	title,
	body,
	actionLabel,
	onPress,
	accessibilityHint,
}: PromoCardProps) {
	const content = (
		<>
			<View style={styles.titleRow}>
				<Icon color={Brand.onBrand} height={ICON_SIZE} width={ICON_SIZE} />

				<Text style={styles.title}>{title}</Text>
			</View>

			<Text style={styles.body}>{body}</Text>
		</>
	);

	if (!actionLabel) {
		return (
			<Pressable
				accessibilityHint={accessibilityHint}
				accessibilityLabel={`${title}. ${body}`}
				accessibilityRole="button"
				onPress={onPress}
				style={({ pressed }) => [styles.card, pressed && styles.pressed]}
			>
				{content}
			</Pressable>
		);
	}

	return (
		<View accessibilityLabel={`${title}. ${body}`} style={styles.card}>
			{content}

			<Pressable
				accessibilityHint={accessibilityHint}
				accessibilityLabel={actionLabel}
				accessibilityRole="button"
				onPress={onPress}
				style={({ pressed }) => [styles.action, pressed && styles.pressed]}
			>
				<Text style={styles.actionLabel}>{actionLabel}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Gap.tight,
		padding: Gap.card,
		borderRadius: Radius.dialog,
		backgroundColor: Brand.pink,
		...BrandGradient,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.tight,
	},
	title: {
		...Type.promoTitle,
		flexShrink: 1,
		color: Brand.onBrand,
	},
	body: {
		...Type.promoBody,
		color: Ink.onBrandMuted,
	},
	action: {
		alignSelf: "flex-start",
		minHeight: ACTION_MIN_HEIGHT,
		minWidth: MinTapTarget * 2,
		alignItems: "center",
		justifyContent: "center",
		marginTop: Spacing.two,
		paddingHorizontal: Spacing.four,
		borderRadius: Radius.control,
		backgroundColor: Brand.purple,
	},
	actionLabel: {
		...Type.cta,
		color: Brand.onBrand,
	},
	pressed: {
		opacity: 0.85,
	},
});
