import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BankIcon from "@/assets/subscription/bank.svg";
import CardIcon from "@/assets/subscription/card.svg";
import LayersIcon from "@/assets/subscription/layers.svg";
import SmartphoneIcon from "@/assets/subscription/smartphone.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { OrderSummary } from "@/components/subscription/order-summary";
import { PaymentMethodRow } from "@/components/subscription/payment-method-row";
import { SecuredBadge } from "@/components/subscription/secured-badge";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/features/subscription/mock-payment";
import { PLANS, isBillingCycle, isPaidPlanId } from "@/features/subscription/plans";

const EDGE_INSET = Spacing.three;

const METHOD_ICONS = {
	card: CardIcon,
	bank: BankIcon,
	mobile: SmartphoneIcon,
	paystack: LayersIcon,
} as const;

/**
 * Select Payment Method (Figma 3178:1641). Only the card method has a
 * designed next screen; the other three go straight to the OTP step, since
 * with a real provider they would hand off to that provider's own sheet.
 */
export default function PaymentMethodScreen() {
	const params = useLocalSearchParams<{ plan?: string; cycle?: string }>();
	const [method, setMethod] = useState<PaymentMethodId>("card");
	const goBack = useCallback(() => router.back(), []);

	const planId = isPaidPlanId(params.plan) ? params.plan : null;
	const cycle = isBillingCycle(params.cycle) ? params.cycle : "monthly";

	if (!planId) {
		return (
			<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
				<StatusBar style="dark" />

				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="Payment Method" />

					<StateMessage
						actionLabel="Back"
						isError
						message="We lost track of which plan you chose. Please pick it again."
						onPressAction={goBack}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const proceed = () => {
		if (method === "card") {
			router.push({
				pathname: "/profile/subscription/card",
				params: { plan: planId, cycle },
			});
			return;
		}

		router.push({
			pathname: "/profile/subscription/verify",
			params: { plan: planId, cycle, method },
		});
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Payment Method" />

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<OrderSummary cycle={cycle} plan={PLANS[planId]} />

					<View style={styles.methods}>
						<Text accessibilityRole="header" style={styles.sectionLabel}>
							SELECT METHOD
						</Text>

						<View accessibilityRole="radiogroup" style={styles.methodList}>
							{PAYMENT_METHODS.map((option) => (
								<PaymentMethodRow
									Icon={METHOD_ICONS[option.id]}
									key={option.id}
									label={option.label}
									onPress={() => setMethod(option.id)}
									selected={method === option.id}
								/>
							))}
						</View>
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<PrimaryButton label="Continue" onPress={proceed} />

					<SecuredBadge />
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
	methods: {
		gap: Gap.card,
		paddingTop: Gap.card,
	},
	sectionLabel: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.muted,
	},
	methodList: {
		gap: Spacing.three,
	},
	footer: {
		gap: Spacing.two,
		paddingBottom: Spacing.two,
	},
});
