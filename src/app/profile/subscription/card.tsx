import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
	type TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { ScreenHeader } from "@/components/nav/screen-header";
import { CardField } from "@/components/subscription/card-field";
import { SecuredBadge } from "@/components/subscription/secured-badge";
import { VirtualCard } from "@/components/subscription/virtual-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import {
	CARD_NUMBER_LENGTH,
	formatCardNumber,
	formatExpiry,
	isValidCardNumber,
	isValidExpiry,
} from "@/features/subscription/mock-payment";
import {
	PLANS,
	formatNaira,
	isBillingCycle,
	isPaidPlanId,
	priceFor,
} from "@/features/subscription/plans";
import { useProfile } from "@/features/profile/use-profile";

const EDGE_INSET = Spacing.three;
const CARD_BRANDS = ["VISA", "Mastercard", "Verve"] as const;

const cardSchema = z.object({
	holderName: z.string().trim().min(2, "Enter the name on the card"),
	number: z
		.string()
		.transform((value) => value.replace(/\s/g, ""))
		.refine(isValidCardNumber, `Enter the ${CARD_NUMBER_LENGTH} digit card number`),
	expiry: z.string().refine(isValidExpiry, "Enter a valid expiry date"),
	cvv: z.string().regex(/^\d{3,4}$/, "Enter the 3 or 4 digit CVV"),
});

type CardValues = z.input<typeof cardSchema>;
type CardInput = z.output<typeof cardSchema>;

/**
 * Card Details (Figma 2844:2775). Nothing typed here leaves the device: the
 * mock provider only carries the last four digits forward, for the receipt.
 * A real provider integration should tokenise on its own SDK and never send
 * the PAN through this app's server.
 */
export default function CardDetailsScreen() {
	const params = useLocalSearchParams<{ plan?: string; cycle?: string }>();
	// Already in the cache from the profile tab this flow was opened from.
	const profile = useProfile();
	const numberRef = useRef<TextInput>(null);
	const expiryRef = useRef<TextInput>(null);
	const cvvRef = useRef<TextInput>(null);
	const goBack = useCallback(() => router.back(), []);

	const planId = isPaidPlanId(params.plan) ? params.plan : null;
	const cycle = isBillingCycle(params.cycle) ? params.cycle : "monthly";

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CardValues, unknown, CardInput>({
		defaultValues: {
			holderName: profile.data?.fullName ?? "",
			number: "",
			expiry: "",
			cvv: "",
		},
		resolver: zodResolver(cardSchema),
		mode: "onTouched",
	});

	if (!planId) {
		return (
			<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
				<StatusBar style="dark" />

				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="Card Details" />

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

	const amount = formatNaira(priceFor(PLANS[planId], cycle));

	const submit = handleSubmit((values: CardInput) => {
		router.push({
			pathname: "/profile/subscription/verify",
			params: { plan: planId, cycle, method: "card", last4: values.number.slice(-4) },
		});
	});

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.column}
			>
				<ScreenHeader onBack={goBack} title="Card Details" />

				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<VirtualCard />

					<View style={styles.brands}>
						<Text style={styles.brandsLabel}>We Accept:</Text>

						<View style={styles.brandList}>
							{CARD_BRANDS.map((brand) => (
								<View key={brand} style={styles.brand}>
									<Text style={styles.brandLabel}>{brand}</Text>
								</View>
							))}
						</View>
					</View>

					<View style={styles.fields}>
						<Controller
							control={control}
							name="holderName"
							render={({ field: { onChange, onBlur, value } }) => (
								<CardField
									autoCapitalize="words"
									autoComplete="cc-name"
									error={errors.holderName?.message}
									label="CARDHOLDER NAME"
									onBlur={onBlur}
									onChangeText={onChange}
									onSubmitEditing={() => numberRef.current?.focus()}
									placeholder="Name on card"
									returnKeyType="next"
									textContentType="name"
									value={value}
								/>
							)}
						/>

						<Controller
							control={control}
							name="number"
							render={({ field: { onChange, onBlur, value } }) => (
								<CardField
									autoComplete="cc-number"
									error={errors.number?.message}
									keyboardType="number-pad"
									label="CARD NUMBER"
									// Sixteen digits plus the three spaces the formatter inserts.
									maxLength={CARD_NUMBER_LENGTH + 3}
									onBlur={onBlur}
									onChangeText={(text) => onChange(formatCardNumber(text))}
									onSubmitEditing={() => expiryRef.current?.focus()}
									placeholder="0000 0000 0000 0000"
									ref={numberRef}
									returnKeyType="next"
									textContentType="creditCardNumber"
									value={value}
								/>
							)}
						/>

						<View style={styles.fieldRow}>
							<Controller
								control={control}
								name="expiry"
								render={({ field: { onChange, onBlur, value } }) => (
									<CardField
										autoComplete="cc-exp"
										containerStyle={styles.halfField}
										error={errors.expiry?.message}
										keyboardType="number-pad"
										label="EXPIRY DATE"
										maxLength={5}
										onBlur={onBlur}
										onChangeText={(text) => onChange(formatExpiry(text))}
										onSubmitEditing={() => cvvRef.current?.focus()}
										placeholder="MM/YY"
										ref={expiryRef}
										returnKeyType="next"
										value={value}
									/>
								)}
							/>

							<Controller
								control={control}
								name="cvv"
								render={({ field: { onChange, onBlur, value } }) => (
									<CardField
										autoComplete="cc-csc"
										containerStyle={styles.halfField}
										error={errors.cvv?.message}
										keyboardType="number-pad"
										label="CVV"
										maxLength={4}
										onBlur={onBlur}
										onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
										onSubmitEditing={submit}
										placeholder="•••"
										ref={cvvRef}
										returnKeyType="done"
										secureTextEntry
										value={value}
									/>
								)}
							/>
						</View>
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<PrimaryButton label={`Pay ${amount}`} onPress={submit} />

					<SecuredBadge />
				</View>
			</KeyboardAvoidingView>
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
	brands: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
		paddingVertical: Spacing.one,
	},
	brandsLabel: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.meta,
	},
	brandList: {
		flexDirection: "row",
		gap: Spacing.one,
	},
	brand: {
		paddingHorizontal: Spacing.two - Spacing.half,
		paddingVertical: Spacing.one,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.codeBox,
	},
	brandLabel: {
		...Type.tagLabel,
		fontFamily: Type.planPrice.fontFamily,
		color: Ink.title,
	},
	fields: {
		gap: Gap.card,
	},
	fieldRow: {
		flexDirection: "row",
		gap: Gap.card,
	},
	halfField: {
		flex: 1,
	},
	footer: {
		gap: Spacing.two,
		paddingBottom: Spacing.two,
	},
});
