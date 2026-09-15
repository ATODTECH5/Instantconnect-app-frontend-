import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { CurrentPlanPlate } from "@/components/subscription/current-plan-plate";
import { PlanCard } from "@/components/subscription/plan-card";
import { Gap, Ink, MaxColumnWidth, Spacing } from "@/constants/theme";
import { PAID_PLANS, PLANS, type PaidPlanId } from "@/features/subscription/plans";
import { useSubscription } from "@/features/subscription/subscription-store";

const EDGE_INSET = Spacing.three;

/**
 * Subscription Plans (Figma 2820:1504). The current plan plate, then the two
 * paid tiers. There is no payment provider yet, so the flow this opens is a
 * mock end to end; see `features/subscription/mock-payment.ts`.
 */
export default function SubscriptionPlansScreen() {
	const subscription = useSubscription();
	const goBack = useCallback(() => router.back(), []);

	const openPlan = useCallback((planId: PaidPlanId) => {
		router.push({ pathname: "/profile/subscription/[plan]", params: { plan: planId } });
	}, []);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Subscription Plans" />

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<CurrentPlanPlate plan={PLANS[subscription.planId]} />

					<View style={styles.tiers}>
						{PAID_PLANS.map((planId) => (
							<PlanCard
								isCurrent={subscription.planId === planId}
								key={planId}
								onPress={() => openPlan(planId)}
								plan={{ ...PLANS[planId], id: planId }}
							/>
						))}
					</View>
				</ScrollView>
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
		paddingBottom: Spacing.five,
	},
	tiers: {
		gap: Spacing.three,
	},
});
