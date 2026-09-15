import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ShieldCheckIcon from "@/assets/subscription/shield-check.svg";
import { OtpInput } from "@/components/auth/otp-input";
import { ScreenHeader } from "@/components/nav/screen-header";
import { PaymentSuccessBadge } from "@/components/subscription/payment-success-badge";
import { SecuredBadge } from "@/components/subscription/secured-badge";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import {
	OTP_LENGTH,
	PaymentDeclinedError,
	confirmPayment,
	isPaymentMethodId,
	requestPaymentOtp,
	type PaymentOrder,
	type PaymentReceipt,
} from "@/features/subscription/mock-payment";
import {
	PLANS,
	formatNaira,
	isBillingCycle,
	isPaidPlanId,
	priceFor,
} from "@/features/subscription/plans";
import { activateSubscription } from "@/features/subscription/subscription-store";
import { useCurrentUser } from "@/features/user/use-current-user";

const EDGE_INSET = Spacing.three;
const SHIELD_DISC = 80;
const SHIELD_ICON = 40;
const LOADER_SIZE = 70;
const CAUTION_WIDTH = 300;

type Stage =
	{ kind: "otp" } | { kind: "processing" } | { kind: "success"; receipt: PaymentReceipt };

/**
 * Verify Payment, three frames on one route: the OTP entry (Figma
 * 2855:2952), the processing loader (2855:3186) and the success hub
 * (2855:3257). One route because the frames share a header and the user
 * must not be able to step back into a payment that is mid-flight.
 */
export default function VerifyPaymentScreen() {
	const params = useLocalSearchParams<{
		plan?: string;
		cycle?: string;
		method?: string;
		last4?: string;
	}>();
	const navigation = useNavigation();
	const user = useCurrentUser();

	const [stage, setStage] = useState<Stage>({ kind: "otp" });
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(true);
	const [cooldown, setCooldown] = useState(0);
	const isPayingRef = useRef(false);

	const planId = isPaidPlanId(params.plan) ? params.plan : null;
	const cycle = isBillingCycle(params.cycle) ? params.cycle : "monthly";
	const method = isPaymentMethodId(params.method) ? params.method : "card";

	const last4 = params.last4;
	const order = useMemo<PaymentOrder | null>(
		() => (planId ? { planId, cycle, method, cardLast4: last4 } : null),
		[planId, cycle, method, last4],
	);
	const amount = planId ? priceFor(PLANS[planId], cycle) : 0;

	// A payment in flight cannot be abandoned: the frame's caution box says as
	// much, and the mock would otherwise resolve into an unmounted screen.
	useEffect(() => {
		if (stage.kind !== "processing") return;

		return navigation.addListener("beforeRemove", (event) => {
			event.preventDefault();
		});
	}, [navigation, stage.kind]);

	// The first code goes out on arrival, the way a provider would send it as
	// soon as the charge is initiated.
	useEffect(() => {
		if (!order) return;

		let isCurrent = true;

		void requestPaymentOtp(order).then(({ cooldownSeconds }) => {
			if (!isCurrent) return;

			setCooldown(cooldownSeconds);
			setIsSending(false);
		});

		return () => {
			isCurrent = false;
		};
	}, [order]);

	const resendOtp = useCallback(async () => {
		if (!order) return;

		setIsSending(true);
		setError(null);

		try {
			const { cooldownSeconds } = await requestPaymentOtp(order);
			setCooldown(cooldownSeconds);
		} finally {
			setIsSending(false);
		}
	}, [order]);

	useEffect(() => {
		if (cooldown <= 0) return;

		const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);

		return () => clearTimeout(timer);
	}, [cooldown]);

	const goBack = useCallback(() => router.back(), []);
	const goHome = useCallback(() => router.replace("/(tabs)"), []);

	const handleChange = useCallback((next: string) => {
		setCode(next);
		setError(null);
	}, []);

	const pay = useCallback(
		async (submitted: string) => {
			if (!order || isPayingRef.current) return;

			if (submitted.length < OTP_LENGTH) {
				setError(`Enter the ${OTP_LENGTH} digit code`);
				return;
			}

			isPayingRef.current = true;
			setError(null);
			setStage({ kind: "processing" });

			try {
				const receipt = await confirmPayment(order, submitted, amount);
				activateSubscription(receipt);
				setStage({ kind: "success", receipt });
			} catch (cause) {
				setStage({ kind: "otp" });
				setCode("");
				setError(
					cause instanceof PaymentDeclinedError
						? cause.message
						: "We could not complete the payment. Please try again.",
				);
			} finally {
				isPayingRef.current = false;
			}
		},
		[order, amount],
	);

	if (!planId || !order) {
		return (
			<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
				<StatusBar style="dark" />

				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="Verify Payment" />

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

	const plan = PLANS[planId];
	const phoneTail = user.data?.phone.replace(/\D/g, "").slice(-2);

	function renderStage() {
		if (stage.kind === "processing") {
			return (
				<View accessibilityLiveRegion="assertive" style={styles.centre}>
					<GradientSpinner size={LOADER_SIZE} />

					<View style={styles.loaderText}>
						<Text accessibilityRole="header" style={styles.loaderTitle}>
							Processing Payment
						</Text>

						<Text style={styles.loaderBody}>Verifying secure channel to bank…</Text>
					</View>

					<View style={styles.caution}>
						<Text style={styles.cautionLabel}>
							Please do not close this page or tap back.
						</Text>
					</View>
				</View>
			);
		}

		if (stage.kind === "success") {
			const { receipt } = stage;
			const nextBilling = new Date(receipt.nextBillingAt).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			});

			return (
				<View accessibilityLiveRegion="polite" style={styles.successHub}>
					<PaymentSuccessBadge />

					<View style={styles.successText}>
						<Text accessibilityRole="header" style={styles.successTitle}>
							Payment Successful!
						</Text>

						<Text style={styles.successBody}>You are now a {plan.name} member</Text>
					</View>

					<View style={styles.receipt}>
						<ReceiptRow label="SELECTED PLAN" value={plan.name} />
						<View style={styles.receiptLine} />
						<ReceiptRow
							label="AMOUNT CHARGED"
							value={formatNaira(receipt.amount, { decimals: 2 })}
							valueTone="brand"
						/>
						<View style={styles.receiptLine} />
						<ReceiptRow label="NEXT BILLING DATE" value={nextBilling} />
					</View>
				</View>
			);
		}

		return (
			<View style={styles.otpStage}>
				<View style={styles.shield}>
					<View style={styles.shieldDisc}>
						<ShieldCheckIcon
							color={Brand.purple}
							height={SHIELD_ICON}
							width={SHIELD_ICON}
						/>
					</View>

					<Text style={styles.prompt}>
						{isSending
							? "Sending a one-time code to your phone"
							: "Enter the OTP sent to your phone"}
						{phoneTail ? (
							<>
								{" ending in "}
								<Text style={styles.promptStrong}>••{phoneTail}</Text>
							</>
						) : null}
					</Text>
				</View>

				{/* Stays editable while the code is being sent, or autoFocus never lands. */}
				<OtpInput
					autoFocus
					error={error ?? undefined}
					length={OTP_LENGTH}
					onChange={handleChange}
					onComplete={pay}
					value={code}
				/>

				<View style={styles.resendRow}>
					<Text style={styles.resendPrompt}>Haven&apos;t received the code?</Text>

					<Pressable
						accessibilityLabel="Resend OTP"
						accessibilityRole="button"
						accessibilityState={{ disabled: isSending || cooldown > 0 }}
						disabled={isSending || cooldown > 0}
						hitSlop={Spacing.two}
						onPress={() => void resendOtp()}
					>
						<Text
							style={[
								styles.resendAction,
								(isSending || cooldown > 0) && styles.resendMuted,
							]}
						>
							{isSending ? "Sending…" : "Resend OTP"}
						</Text>
					</Pressable>

					{cooldown > 0 ? (
						<Text style={styles.cooldown}>({formatCooldown(cooldown)})</Text>
					) : null}
				</View>
			</View>
		);
	}

	const isProcessing = stage.kind === "processing";
	const isSuccess = stage.kind === "success";

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader
					backLabel={isSuccess ? "Go home" : "Go back"}
					onBack={isProcessing ? () => {} : isSuccess ? goHome : goBack}
					title="Verify Payment"
				/>

				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{renderStage()}
				</ScrollView>

				<View style={styles.footer}>
					{isSuccess ? (
						<PrimaryButton label="Home" onPress={goHome} />
					) : isProcessing ? null : (
						<PrimaryButton
							disabled={isSending || code.length < OTP_LENGTH}
							label={`Pay ${formatNaira(amount)}`}
							onPress={() => void pay(code)}
						/>
					)}

					{isSuccess ? null : <SecuredBadge />}
				</View>
			</View>
		</SafeAreaView>
	);
}

function ReceiptRow({
	label,
	value,
	valueTone = "ink",
}: {
	label: string;
	value: string;
	valueTone?: "ink" | "brand";
}) {
	return (
		<View style={styles.receiptRow}>
			<Text style={styles.receiptLabel}>{label}</Text>

			<Text style={[styles.receiptValue, valueTone === "brand" && styles.receiptValueBrand]}>
				{value}
			</Text>
		</View>
	);
}

function formatCooldown(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const rest = seconds % 60;

	return `${minutes}:${String(rest).padStart(2, "0")}`;
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
		flexGrow: 1,
		paddingTop: Spacing.one,
		paddingBottom: Spacing.three,
	},
	otpStage: {
		gap: Gap.card,
	},
	shield: {
		alignItems: "center",
		gap: Spacing.three,
		paddingVertical: Spacing.four,
	},
	shieldDisc: {
		width: SHIELD_DISC,
		height: SHIELD_DISC,
		borderRadius: SHIELD_DISC / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	prompt: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.muted,
		textAlign: "center",
		paddingHorizontal: Spacing.five,
	},
	promptStrong: {
		fontFamily: Type.planPrice.fontFamily,
		color: Ink.title,
	},
	resendRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		alignItems: "center",
		gap: Spacing.two,
		paddingTop: Spacing.four,
	},
	resendPrompt: {
		...Type.footnote,
		color: Ink.meta,
	},
	resendAction: {
		...Type.footnoteLink,
		color: Brand.purple,
	},
	resendMuted: {
		color: Ink.placeholder,
	},
	cooldown: {
		...Type.footnoteLink,
		color: Brand.orange,
	},
	centre: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.four,
	},
	loaderText: {
		alignItems: "center",
		gap: Spacing.two,
	},
	loaderTitle: {
		...Type.heroTitle,
		color: Ink.title,
	},
	loaderBody: {
		...Type.promoBody,
		color: Ink.meta,
	},
	caution: {
		width: "100%",
		maxWidth: CAUTION_WIDTH,
		alignItems: "center",
		padding: Gap.card,
		borderWidth: 1,
		borderColor: Ink.warningBorder,
		borderRadius: Radius.control,
		backgroundColor: Ink.warningSurface,
	},
	cautionLabel: {
		...Type.badgeLabel,
		color: Ink.warning,
		textAlign: "center",
	},
	successHub: {
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
	successBody: {
		...Type.profileMeta,
		color: Ink.meta,
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
