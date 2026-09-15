import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { BillingSegment } from "@/components/subscription/billing-segment";
import { FeatureRow } from "@/components/subscription/feature-row";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import {
	Brand,
	BrandGradient,
	Gap,
	Ink,
	MaxColumnWidth,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import {
	ANNUAL_DISCOUNT,
	PLANS,
	annualSaving,
	cycleSuffix,
	cycleSuffixShort,
	formatNaira,
	includedFeatures,
	isPaidPlanId,
	priceFor,
	type BillingCycle,
} from "@/features/subscription/plans";

const EDGE_INSET = Spacing.three;
const ON_GRADIENT_BODY = "rgba(255, 255, 255, 0.88)";
const ON_GRADIENT_PILL = "rgba(255, 255, 255, 0.19)";

/**
 * Plan Details (Figma 2827:1887). The frame draws Pro; Premium borrows the
 * plans screen's pale card for its header so the two tiers keep their
 * colours across screens.
 */
export default function PlanDetailsScreen() {
	const { plan: planParam } = useLocalSearchParams<{ plan?: string }>();
	const [cycle, setCycle] = useState<BillingCycle>("monthly");
	const goBack = useCallback(() => router.back(), []);

	if (!isPaidPlanId(planParam)) {
		return (
			<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
				<StatusBar style="dark" />

				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="Plan Details" />

					<StateMessage
						actionLabel="Back to plans"
						isError
						message="We could not find that plan."
						onPressAction={goBack}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const plan = PLANS[planParam];
	const isPro = planParam === "pro";
	const shortName = isPro ? "Pro" : "Premium";
	const price = priceFor(plan, cycle);
	const saving = annualSaving(plan);
	const otherCycle: BillingCycle = cycle === "monthly" ? "annual" : "monthly";

	const proceed = () => {
		router.push({
			pathname: "/profile/subscription/payment-method",
			params: { plan: planParam, cycle },
		});
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Plan Details" />

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<View style={[styles.hero, isPro ? styles.heroPro : styles.heroPremium]}>
						<View style={styles.heroRow}>
							<Text
								style={[styles.heroName, isPro ? styles.onGradient : styles.purple]}
							>
								{plan.name}
							</Text>

							<View
								style={[
									styles.heroPill,
									isPro ? styles.heroPillPro : styles.heroPillPremium,
								]}
							>
								<Text
									style={[
										styles.heroPillLabel,
										isPro ? styles.onGradient : styles.purple,
									]}
								>
									ACTIVE CHOICE
								</Text>
							</View>
						</View>

						<Text
							style={[styles.heroBody, isPro ? styles.onGradientBody : styles.muted]}
						>
							{plan.description}
						</Text>
					</View>

					<View style={styles.pricingPanel}>
						<BillingSegment
							onChange={setCycle}
							savingsLabel={`Save ${Math.round(ANNUAL_DISCOUNT * 100)}%`}
							value={cycle}
						/>

						<View style={styles.pricingHeader}>
							<View style={styles.priceGroup}>
								<View style={styles.priceRow}>
									<Text style={styles.price}>{formatNaira(price)}</Text>

									<Text style={styles.priceSuffix}>{cycleSuffix(cycle)}</Text>
								</View>

								<Text style={styles.billedNote}>
									{cycle === "monthly" ? "Billed monthly." : "Billed yearly."}{" "}
									Cancel anytime.
								</Text>
							</View>

							<View style={styles.switchGroup}>
								<Text style={styles.altPrice}>
									{cycle === "monthly"
										? `${formatNaira(priceFor(plan, "annual"))}/year`
										: `You save ${formatNaira(saving)}`}
								</Text>

								<Pressable
									accessibilityLabel={
										cycle === "monthly"
											? `Switch to annual billing and save ${formatNaira(saving)}`
											: "Switch to monthly billing"
									}
									accessibilityRole="button"
									hitSlop={Spacing.two}
									onPress={() => setCycle(otherCycle)}
								>
									<Text style={styles.switchLink}>
										{cycle === "monthly"
											? `Switch to save ${formatNaira(saving)}`
											: "Switch to monthly"}
									</Text>
								</Pressable>
							</View>
						</View>
					</View>

					<View style={styles.included}>
						<Text accessibilityRole="header" style={styles.includedTitle}>
							WHAT&apos;S INCLUDED
						</Text>

						<View style={styles.featureList}>
							{includedFeatures(plan).map((feature) => (
								<FeatureRow key={feature} label={feature} />
							))}
						</View>
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<PrimaryButton
						label={`Upgrade to ${shortName} — ${formatNaira(price)}${cycleSuffixShort(cycle)}`}
						onPress={proceed}
					/>

					<Text style={styles.footnote}>Cancel anytime. Terms and conditions apply.</Text>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	column: {
		flex: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	content: {
		gap: Spacing.three,
		paddingTop: Spacing.one,
		paddingBottom: Spacing.three,
	},
	hero: {
		gap: Gap.section,
		padding: Gap.card,
		borderRadius: Radius.dialog,
	},
	heroPro: {
		...BrandGradient,
	},
	heroPremium: {
		backgroundColor: Ink.keypad,
	},
	heroRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
	},
	heroName: {
		...Type.subtitle,
		flexShrink: 1,
	},
	heroPill: {
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.one,
		borderRadius: Radius.dialog,
	},
	heroPillPro: {
		backgroundColor: ON_GRADIENT_PILL,
	},
	heroPillPremium: {
		backgroundColor: Brand.purpleTint,
	},
	heroPillLabel: {
		...Type.tagLabel,
		fontFamily: Type.action.fontFamily,
	},
	heroBody: {
		...Type.profileMeta,
	},
	onGradient: {
		color: Brand.onBrand,
	},
	onGradientBody: {
		color: ON_GRADIENT_BODY,
	},
	purple: {
		color: Brand.purple,
	},
	muted: {
		color: Ink.muted,
	},
	pricingPanel: {
		gap: Gap.section,
		paddingVertical: Gap.section,
		paddingHorizontal: Gap.card,
		borderWidth: 1,
		borderColor: Brand.purpleTint,
		borderRadius: Radius.media,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	pricingHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
	},
	priceGroup: {
		flexShrink: 1,
		gap: Spacing.one,
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: Spacing.one,
	},
	price: {
		...Type.priceLarge,
		color: Ink.body,
	},
	priceSuffix: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.meta,
	},
	billedNote: {
		...Type.promoBody,
		color: Ink.meta,
	},
	switchGroup: {
		alignItems: "flex-end",
		gap: Spacing.half,
	},
	altPrice: {
		...Type.profileMeta,
		fontFamily: Type.cta.fontFamily,
		color: Brand.orange,
	},
	switchLink: {
		...Type.cardMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.muted,
		textDecorationLine: "underline",
	},
	included: {
		gap: Spacing.three,
	},
	includedTitle: {
		...Type.featureTitle,
		color: Ink.title,
	},
	featureList: {
		gap: Gap.card,
	},
	footer: {
		gap: Gap.card,
		paddingBottom: Spacing.two,
	},
	footnote: {
		...Type.footnote,
		letterSpacing: 0.2,
		color: Ink.meta,
		textAlign: "center",
	},
});
