import { Pressable, StyleSheet, Text, View } from "react-native";

import { Brand, BrandGradient, Gap, Ink, MinTapTarget, Radius, Type } from "@/constants/theme";
import {
	cycleSuffix,
	formatNaira,
	type PaidPlanId,
	type Plan,
} from "@/features/subscription/plans";

const BULLET_SIZE = 6;
const CARD_PADDING = 20;

/** Tint for copy sitting on the Pro card's gradient. */
const ON_GRADIENT_MUTED = "rgba(255, 255, 255, 0.8)";
const ON_GRADIENT_LINE = "rgba(255, 255, 255, 0.3)";

export type PlanCardProps = {
	plan: Plan & { id: PaidPlanId };
	/** The frame draws this tier's card as the account's active plan. */
	isCurrent: boolean;
	onPress: () => void;
};

/**
 * Premium sits on the pale grey plate with a purple title; Pro is the brand
 * gradient with a white button. Both list the same bullet features and the
 * monthly price, since the plans screen only shows monthly.
 */
export function PlanCard({ plan, isCurrent, onPress }: PlanCardProps) {
	const isPro = plan.id === "pro";
	const ctaLabel = isCurrent ? "Current Plan" : `Upgrade to ${isPro ? "Pro" : "Premium"}`;

	return (
		<View style={[styles.card, isPro ? styles.cardPro : styles.cardPremium]}>
			<View style={styles.titleBlock}>
				<View style={styles.titleGroup}>
					<Text style={[styles.name, isPro ? styles.namePro : styles.namePremium]}>
						{plan.name}
					</Text>

					<Text style={[styles.tagline, isPro && styles.onGradientMuted]}>
						{plan.tagline}
					</Text>
				</View>

				<View style={styles.pricing}>
					<Text style={[styles.price, isPro && styles.onGradient]}>
						{formatNaira(plan.monthlyPrice)}
					</Text>

					<Text style={[styles.period, isPro && styles.onGradientMuted]}>
						{cycleSuffix("monthly")}
					</Text>
				</View>
			</View>

			<View style={[styles.line, isPro && styles.linePro]} />

			<View style={styles.features}>
				{plan.features.map((feature) => (
					<View key={feature} style={styles.bulletRow}>
						<View style={[styles.bullet, isPro && styles.bulletPro]} />

						<Text style={[styles.feature, isPro && styles.onGradientMuted]}>
							{feature}
						</Text>
					</View>
				))}
			</View>

			<Pressable
				accessibilityLabel={ctaLabel}
				accessibilityRole="button"
				accessibilityState={{ disabled: isCurrent }}
				disabled={isCurrent}
				onPress={onPress}
				style={({ pressed }) => [
					styles.cta,
					isPro ? styles.ctaPro : styles.ctaPremium,
					isCurrent && styles.ctaCurrent,
					pressed && !isCurrent && styles.pressed,
				]}
			>
				<Text
					style={[styles.ctaLabel, isPro ? styles.ctaLabelPro : styles.ctaLabelPremium]}
				>
					{ctaLabel}
				</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Gap.section,
		padding: CARD_PADDING,
		borderRadius: Radius.dialog,
	},
	cardPremium: {
		backgroundColor: Ink.keypad,
	},
	cardPro: {
		...BrandGradient,
	},
	titleBlock: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
	},
	titleGroup: {
		flexShrink: 1,
		gap: Gap.tight,
	},
	name: {
		...Type.subtitle,
	},
	namePremium: {
		color: Brand.purple,
	},
	namePro: {
		color: Brand.onBrand,
	},
	tagline: {
		...Type.promoBody,
		color: Ink.muted,
	},
	pricing: {
		alignItems: "flex-end",
	},
	price: {
		...Type.planPrice,
		color: Ink.title,
	},
	period: {
		...Type.cardMeta,
		color: Ink.muted,
	},
	line: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: Ink.border,
	},
	linePro: {
		backgroundColor: ON_GRADIENT_LINE,
	},
	features: {
		gap: Gap.snug,
	},
	bulletRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
	},
	bullet: {
		width: BULLET_SIZE,
		height: BULLET_SIZE,
		borderRadius: BULLET_SIZE / 2,
		backgroundColor: Ink.muted,
	},
	bulletPro: {
		backgroundColor: ON_GRADIENT_MUTED,
	},
	feature: {
		...Type.profileMeta,
		flexShrink: 1,
		color: Ink.muted,
	},
	onGradient: {
		color: Brand.onBrand,
	},
	onGradientMuted: {
		color: ON_GRADIENT_MUTED,
	},
	cta: {
		minHeight: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
		padding: Gap.card,
		borderRadius: Radius.control,
	},
	ctaPremium: {
		backgroundColor: Brand.purple,
	},
	ctaPro: {
		backgroundColor: Ink.surface,
	},
	ctaCurrent: {
		opacity: 0.6,
	},
	ctaLabel: {
		...Type.action,
	},
	ctaLabelPremium: {
		fontFamily: Type.cta.fontFamily,
		color: Brand.onBrand,
	},
	ctaLabelPro: {
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.85,
	},
});
