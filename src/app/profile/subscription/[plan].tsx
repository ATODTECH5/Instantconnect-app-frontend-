import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { BillingSegment } from "@/components/subscription/billing-segment";
import { FeatureRow } from "@/components/subscription/feature-row";
import { PaystackCheckoutSheet } from "@/components/subscription/paystack-checkout-sheet";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
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
	annualDiscountPercent,
	annualSaving,
	cycleSuffix,
	cycleSuffixShort,
	formatNaira,
	priceFor,
	type BillingCycle,
} from "@/features/subscription/plans";
import { startCheckout } from "@/features/subscription/subscription-service";
import { useMySubscription, usePlans } from "@/features/subscription/use-subscription";
import { describeError } from "@/lib/api/api-error";
import type { ApiCheckout } from "@/lib/api/subscription-schema";

const EDGE_INSET = Spacing.three;
const ON_GRADIENT_BODY = "rgba(255, 255, 255, 0.88)";
const ON_GRADIENT_PILL = "rgba(255, 255, 255, 0.19)";

/**
 * Plan Details (Figma 2827:1887). The frame draws Pro; Premium borrows the
 * plans screen's pale card for its header so the two tiers keep their
 * colours across screens. Paying opens Paystack's own checkout page in a
 * sheet over this screen, so card details never enter the app.
 */
export default function PlanDetailsScreen() {
	const { plan: planParam } = useLocalSearchParams<{ plan?: string }>();
	const plans = usePlans();
	const mine = useMySubscription();
	const [cycle, setCycle] = useState<BillingCycle>("monthly");
	const [isStarting, setIsStarting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [checkout, setCheckout] = useState<ApiCheckout | null>(null);
	const goBack = useCallback(() => router.back(), []);

	const plan = plans.data?.find((candidate) => candidate.id === planParam);

	if (plans.isPending || !plan) {
		return (
			<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
				<StatusBar style="dark" />

				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="Plan Details" />

					{plans.isPending ? (
						<StateMessage message="Loading plan…" />
					) : plans.isError ? (
						<StateMessage
							actionLabel="Try again"
							isError
							message={describeError(plans.error)}
							onPressAction={() => void plans.refetch()}
						/>
					) : (
						<StateMessage
							actionLabel="Back to plans"
							isError
							message="We could not find that plan."
							onPressAction={goBack}
						/>
					)}
				</View>
			</SafeAreaView>
		);
	}

	const isPro = plan.id === "pro";
	const shortName = plan.name.split(" ")[0];
	const price = priceFor(plan, cycle);
	const saving = annualSaving(plan);
	const otherCycle: BillingCycle = cycle === "monthly" ? "annual" : "monthly";
	const isCurrent = mine.data?.planId === plan.id && mine.data.cycle === cycle;
	const paymentsEnabled = mine.data?.paymentsEnabled ?? true;

	const proceed = async () => {
		setError(null);
		setIsStarting(true);

		try {
			setCheckout(await startCheckout(plan.id, cycle));
		} catch (cause) {
			setError(describeError(cause));
		} finally {
			setIsStarting(false);
		}
	};

	const finishCheckout = () => {
		if (!checkout) return;

		setCheckout(null);
		router.replace({
			pathname: "/profile/subscription/complete",
			params: { reference: checkout.reference },
		});
	};

	// Backing out stays here. A charge that settled anyway reaches the server
	// by webhook, so the plan is fetched again rather than assumed unchanged.
	const closeCheckout = () => {
		setCheckout(null);
		void mine.refetch();
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<PaystackCheckoutSheet
				authorizationUrl={checkout?.authorizationUrl ?? null}
				callbackUrl={checkout?.callbackUrl ?? ""}
				onClose={closeCheckout}
				onFinished={finishCheckout}
			/>

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
							savingsLabel={`Save ${annualDiscountPercent(plan)}%`}
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
										? `${formatNaira(plan.annualPrice)}/year`
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
							{plan.features.map((feature) => (
								<FeatureRow key={feature} label={feature} />
							))}
						</View>
					</View>
				</ScrollView>

				<View style={styles.footer}>
					{error ? <FormErrorBanner message={error} /> : null}

					<PrimaryButton
						disabled={isCurrent || !paymentsEnabled}
						label={
							isCurrent
								? "Your Current Plan"
								: `Upgrade to ${shortName} — ${formatNaira(price)}${cycleSuffixShort(cycle)}`
						}
						loading={isStarting}
						onPress={() => void proceed()}
					/>

					<Text style={styles.footnote}>
						{paymentsEnabled
							? "Secure checkout by Paystack. Cancel anytime. Terms and conditions apply."
							: "Upgrades aren't available right now."}
					</Text>
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
