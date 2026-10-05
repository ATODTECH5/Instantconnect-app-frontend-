import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { PaymentSuccessBadge } from "@/components/subscription/payment-success-badge";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { FREE_PLAN, formatNaira, priceFor } from "@/features/subscription/plans";
import { useConfirmCheckout, usePlans } from "@/features/subscription/use-subscription";
import { describeError } from "@/lib/api/api-error";
import type { ApiCheckoutResult } from "@/lib/api/subscription-schema";
import { formatLongDate } from "@/utils/format";

const LOADER_SIZE = 70;
/** Paystack can take a few seconds to settle a payment after the page closes. */
const ATTEMPTS = 5;
const RETRY_MS = 3000;

type Stage =
	| { kind: "checking" }
	| { kind: "done"; result: ApiCheckoutResult }
	| { kind: "error"; message: string };

/**
 * Where the app lands after Paystack's checkout page closes, however it
 * closed. The server verifies the payment with Paystack; the screen only
 * reports what it says.
 */
export default function SubscriptionCompleteScreen() {
	const { reference = "" } = useLocalSearchParams<{ reference?: string }>();
	const plans = usePlans();
	const confirm = useConfirmCheckout();
	const [stage, setStage] = useState<Stage>({ kind: "checking" });
	const checkRef = useRef<(attempt: number) => void>(() => undefined);

	const check = useCallback(
		(attempt: number) => {
			confirm.mutate(reference, {
				onSuccess: (result) => {
					if (result.paymentStatus === "pending" && attempt < ATTEMPTS) {
						setTimeout(() => checkRef.current(attempt + 1), RETRY_MS);
						return;
					}

					setStage({ kind: "done", result });
				},
				onError: (cause) => setStage({ kind: "error", message: describeError(cause) }),
			});
		},
		[confirm, reference],
	);

	useEffect(() => {
		checkRef.current = check;
	}, [check]);

	useEffect(() => {
		if (reference) checkRef.current(1);
		// Once per reference: retries are scheduled by the check itself.
	}, [reference]);

	const recheck = () => {
		setStage({ kind: "checking" });
		check(1);
	};

	const goPlans = () => router.replace("/profile/subscription");
	const goHome = () => router.replace("/(tabs)");

	function body() {
		if (!reference) {
			return <StateMessage isError message="We lost track of that payment." />;
		}

		if (stage.kind === "checking") {
			return (
				<View accessibilityLiveRegion="polite" style={styles.centre}>
					<GradientSpinner size={LOADER_SIZE} />
					<Text accessibilityRole="header" style={styles.title}>
						Confirming your payment
					</Text>
					<Text style={styles.body}>This takes a few seconds.</Text>
				</View>
			);
		}

		if (stage.kind === "error") {
			return (
				<View style={styles.centre}>
					<Text accessibilityRole="header" style={styles.title}>
						We couldn&apos;t confirm your payment
					</Text>
					<Text style={styles.body}>{stage.message}</Text>
				</View>
			);
		}

		const { result } = stage;
		const subscription = result.subscription;

		if (result.paymentStatus === "success") {
			const plan =
				plans.data?.find((candidate) => candidate.id === subscription.planId) ?? FREE_PLAN;
			const amount = subscription.cycle ? priceFor(plan, subscription.cycle) : 0;

			return (
				<View accessibilityLiveRegion="polite" style={styles.success}>
					<PaymentSuccessBadge />

					<View style={styles.successText}>
						<Text accessibilityRole="header" style={styles.successTitle}>
							Payment Successful!
						</Text>
						<Text style={styles.body}>You are now a {plan.name} member</Text>
					</View>

					<View style={styles.receipt}>
						<ReceiptRow label="SELECTED PLAN" value={plan.name} />
						<View style={styles.receiptLine} />
						<ReceiptRow
							label="AMOUNT CHARGED"
							tone="brand"
							value={formatNaira(amount, { decimals: 2 })}
						/>
						<View style={styles.receiptLine} />
						<ReceiptRow
							label="NEXT BILLING DATE"
							value={
								subscription.currentPeriodEnd
									? formatLongDate(new Date(subscription.currentPeriodEnd))
									: "—"
							}
						/>
					</View>
				</View>
			);
		}

		return (
			<View style={styles.centre}>
				<Text accessibilityRole="header" style={styles.title}>
					{result.paymentStatus === "pending"
						? "Payment not received yet"
						: "Payment didn't go through"}
				</Text>
				<Text style={styles.body}>
					{result.paymentStatus === "pending"
						? "If you finished paying, it can take a minute to arrive. You haven't been charged twice."
						: (result.failureReason ?? "Nothing was charged. You can try again.")}
				</Text>
			</View>
		);
	}

	const succeeded = stage.kind === "done" && stage.result.paymentStatus === "success";
	const pending = stage.kind === "done" && stage.result.paymentStatus === "pending";

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader
					backLabel={succeeded ? "Go home" : "Back to plans"}
					onBack={succeeded ? goHome : goPlans}
					title="Payment"
				/>

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					{body()}
				</ScrollView>

				{stage.kind === "checking" ? null : (
					<View style={styles.footer}>
						{succeeded ? (
							<PrimaryButton label="Home" onPress={goHome} />
						) : (
							<>
								{pending || stage.kind === "error" ? (
									<PrimaryButton
										label="Check Again"
										loading={confirm.isPending}
										onPress={recheck}
									/>
								) : null}
								<SecondaryButton
									label="Back to Plans"
									onPress={goPlans}
									tone="brand"
								/>
							</>
						)}
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}

function ReceiptRow({
	label,
	value,
	tone = "ink",
}: {
	label: string;
	value: string;
	tone?: "ink" | "brand";
}) {
	return (
		<View style={styles.receiptRow}>
			<Text style={styles.receiptLabel}>{label}</Text>
			<Text style={[styles.receiptValue, tone === "brand" && styles.receiptValueBrand]}>
				{value}
			</Text>
		</View>
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
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	content: {
		flexGrow: 1,
		paddingBottom: Spacing.three,
	},
	centre: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.three,
		paddingHorizontal: Spacing.three,
	},
	title: {
		...Type.heroTitle,
		color: Ink.title,
		textAlign: "center",
	},
	body: {
		...Type.profileMeta,
		color: Ink.meta,
		textAlign: "center",
	},
	success: {
		alignItems: "center",
		gap: Spacing.five,
		paddingTop: Spacing.six,
		paddingHorizontal: Spacing.two,
	},
	successText: {
		alignItems: "center",
		gap: Gap.card,
	},
	successTitle: {
		...Type.successTitle,
		fontFamily: Type.cta.fontFamily,
		color: Ink.title,
		textAlign: "center",
	},
	receipt: {
		alignSelf: "stretch",
		gap: Spacing.three - Spacing.half,
		padding: Gap.section,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.media,
		backgroundColor: Ink.keypad,
	},
	receiptRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
	},
	receiptLabel: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.meta,
	},
	receiptValue: {
		...Type.profileMeta,
		fontFamily: Type.cta.fontFamily,
		color: Ink.body,
	},
	receiptValueBrand: {
		fontFamily: Type.planPrice.fontFamily,
		color: Brand.purple,
	},
	receiptLine: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: Ink.border,
	},
	footer: {
		gap: Spacing.two,
		paddingBottom: Spacing.two,
	},
});
