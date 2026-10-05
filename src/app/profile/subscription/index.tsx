import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { CurrentPlanPlate } from "@/components/subscription/current-plan-plate";
import { PlanCard } from "@/components/subscription/plan-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Toast } from "@/components/ui/toast";
import { Brand, Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { FREE_PLAN } from "@/features/subscription/plans";
import {
	useCancelSubscription,
	useMySubscription,
	usePlans,
} from "@/features/subscription/use-subscription";
import { describeError } from "@/lib/api/api-error";
import { formatLongDate } from "@/utils/format";

const EDGE_INSET = Spacing.three;

/**
 * Subscription Plans (Figma 2820:1504): the current plan, then the paid
 * tiers from the server. A paid member can stop renewal here; the plan
 * stays until the period they paid for ends.
 */
export default function SubscriptionPlansScreen() {
	const plans = usePlans();
	const mine = useMySubscription();
	const cancel = useCancelSubscription();
	const [confirmCancel, setConfirmCancel] = useState(false);
	const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
	const goBack = useCallback(() => router.back(), []);

	const openPlan = useCallback((planId: string) => {
		router.push({ pathname: "/profile/subscription/[plan]", params: { plan: planId } });
	}, []);

	const loading = plans.isPending || mine.isPending;
	const failed = plans.isError ? plans.error : mine.isError ? mine.error : null;
	const current = plans.data?.find((plan) => plan.id === mine.data?.planId) ?? FREE_PLAN;
	const subscription = mine.data;
	const periodEnd = subscription?.currentPeriodEnd
		? formatLongDate(new Date(subscription.currentPeriodEnd))
		: null;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Subscription Plans" />

				{loading ? (
					<StateMessage message="Loading plans…" />
				) : failed ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(failed)}
						onPressAction={() => {
							void plans.refetch();
							void mine.refetch();
						}}
					/>
				) : (
					<ScrollView
						contentContainerStyle={styles.content}
						refreshControl={
							<RefreshControl
								onRefresh={() => {
									void plans.refetch();
									void mine.refetch();
								}}
								refreshing={plans.isRefetching || mine.isRefetching}
								tintColor={Brand.purple}
							/>
						}
						showsVerticalScrollIndicator={false}
					>
						<CurrentPlanPlate plan={current} />

						{subscription && subscription.planId !== "free" && periodEnd ? (
							<View style={styles.manage}>
								<Text style={styles.manageNote}>
									{subscription.cancelAtPeriodEnd
										? `Your plan ends on ${periodEnd}. It won't renew.`
										: subscription.status === "past_due"
											? "Your last renewal didn't go through. Paystack will retry the card on file."
											: `Renews on ${periodEnd}.`}
								</Text>

								{!subscription.cancelAtPeriodEnd ? (
									<SecondaryButton
										accessibilityHint="Asks you to confirm before stopping renewal"
										label="Cancel Renewal"
										onPress={() => setConfirmCancel(true)}
										tone="danger"
									/>
								) : null}
							</View>
						) : null}

						{!subscription?.paymentsEnabled ? (
							<Text style={styles.manageNote}>
								Upgrades aren&apos;t available right now. Check back soon.
							</Text>
						) : null}

						<View style={styles.tiers}>
							{(plans.data ?? []).map((plan) => (
								<PlanCard
									isCurrent={subscription?.planId === plan.id}
									key={plan.id}
									onPress={() => openPlan(plan.id)}
									plan={plan}
								/>
							))}
						</View>
					</ScrollView>
				)}
			</View>

			<ConfirmDialog
				cancelLabel="Keep My Plan"
				confirmLabel="Cancel Renewal"
				message={
					periodEnd
						? `You keep ${current.name} until ${periodEnd}, then move to the free plan.`
						: "You keep your plan until the end of the period you paid for."
				}
				onCancel={() => setConfirmCancel(false)}
				onConfirm={() => {
					setConfirmCancel(false);
					cancel.mutate(undefined, {
						onSuccess: () =>
							setToast({ message: "Renewal cancelled.", tone: "success" }),
						onError: (cause) =>
							setToast({ message: describeError(cause), tone: "error" }),
					});
				}}
				title="Stop your plan from renewing?"
				visible={confirmCancel}
			/>

			{toast ? (
				<Toast message={toast.message} onDismiss={() => setToast(null)} tone={toast.tone} />
			) : null}
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
	manage: {
		gap: Gap.card,
	},
	manageNote: {
		...Type.promoBody,
		color: Ink.meta,
	},
	tiers: {
		gap: Spacing.three,
	},
});
