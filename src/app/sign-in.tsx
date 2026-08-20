import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View, type TextInput } from "react-native";

import { AuthFooterNote } from "@/components/auth/auth-footer-note";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { BiometricsDialog } from "@/components/auth/biometrics-dialog";
import { SocialAuthRow, type SocialProvider } from "@/components/auth/social-auth-row";
import { Checkbox } from "@/components/ui/checkbox";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { LabelledDivider } from "@/components/ui/labelled-divider";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Ink, Spacing, Type } from "@/constants/theme";
import { setBiometricsEnabled, signIn } from "@/features/auth/auth-service";
import {
	BIOMETRIC_LABEL,
	getBiometricSupport,
	promptBiometrics,
	type BiometricKind,
} from "@/features/auth/biometrics";
import { signInSchema, type SignInInput, type SignInValues } from "@/features/auth/sign-in-schema";
import { describeError } from "@/lib/api/api-error";

const FIELD_GAP = 22;

const DEFAULT_VALUES: SignInValues = {
	email: "",
	password: "",
	keepSignedIn: false,
};

export default function SignInScreen() {
	const passwordRef = useRef<TextInput>(null);
	const isSubmittingRef = useRef(false);

	const [formError, setFormError] = useState<string | null>(null);
	const [biometricKind, setBiometricKind] = useState<BiometricKind | null>(null);
	const [isEnrolling, setIsEnrolling] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInValues, unknown, SignInInput>({
		defaultValues: DEFAULT_VALUES,
		resolver: zodResolver(signInSchema),
		mode: "onTouched",
	});

	const handleBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/get-started");
	}, []);

	// Location is asked for once sign in is settled, so the permission prompt is
	// never competing with the biometrics prompt for the same moment.
	const enterApp = useCallback(() => router.replace("/location"), []);

	const onValid = useCallback(
		async (values: SignInInput) => {
			if (isSubmittingRef.current) return;
			isSubmittingRef.current = true;
			setFormError(null);

			try {
				await signIn(values);

				// Only worth offering where the device can actually honour it.
				const support = await getBiometricSupport();

				if (support.available) setBiometricKind(support.kind);
				else enterApp();
			} catch (cause) {
				setFormError(describeError(cause));
			} finally {
				isSubmittingRef.current = false;
			}
		},
		[enterApp],
	);

	// Built inside the handler rather than during render, so the guard ref is
	// never read while rendering.
	const submit = useCallback(() => handleSubmit(onValid)(), [handleSubmit, onValid]);

	const handleEnableBiometrics = useCallback(async () => {
		if (!biometricKind) return;

		setIsEnrolling(true);

		try {
			const result = await promptBiometrics(
				`Use ${BIOMETRIC_LABEL[biometricKind]} to sign in to InstantConnect`,
			);

			if (result.success) await setBiometricsEnabled(true);
			// A failed or cancelled prompt is not an error worth blocking sign in.
		} finally {
			setIsEnrolling(false);
			setBiometricKind(null);
			enterApp();
		}
	}, [biometricKind, enterApp]);

	const handleSkipBiometrics = useCallback(() => {
		setBiometricKind(null);
		enterApp();
	}, [enterApp]);

	// Social sign in has no destination in the app yet.
	const handleSocial = useCallback((_provider: SocialProvider) => {}, []);

	const handleForgotPassword = useCallback(() => router.push("/forgot-password"), []);

	const goToSignUp = useCallback(() => router.replace("/sign-up"), []);

	return (
		<>
			<StatusBar style="light" />

			<AuthScreenLayout
				onBack={handleBack}
				subtitle="Sign in to continue connecting with real people nearby."
				title="Welcome Back"
			>
				<View style={styles.fields}>
					<Controller
						control={control}
						name="email"
						render={({ field: { onChange, onBlur, value } }) => (
							<FormField
								autoCapitalize="none"
								autoComplete="email"
								error={errors.email?.message}
								inputMode="email"
								keyboardType="email-address"
								label="Email"
								onBlur={onBlur}
								onChangeText={onChange}
								onSubmitEditing={() => passwordRef.current?.focus()}
								placeholder="Enter email"
								returnKeyType="next"
								textContentType="emailAddress"
								value={value}
							/>
						)}
					/>

					<Controller
						control={control}
						name="password"
						render={({ field: { onChange, onBlur, value } }) => (
							<FormField
								autoCapitalize="none"
								autoComplete="current-password"
								error={errors.password?.message}
								label="Password"
								onBlur={onBlur}
								onChangeText={onChange}
								onSubmitEditing={submit}
								placeholder="Enter Password"
								ref={passwordRef}
								returnKeyType="go"
								secure
								textContentType="password"
								value={value}
							/>
						)}
					/>
				</View>

				{formError ? (
					<View style={styles.formError}>
						<FormErrorBanner message={formError} />
					</View>
				) : null}

				<View style={styles.optionsRow}>
					<Controller
						control={control}
						name="keepSignedIn"
						render={({ field: { onChange, value } }) => (
							<Pressable
								accessibilityLabel="Keep me signed in"
								accessibilityRole="checkbox"
								accessibilityState={{ checked: value === true }}
								onPress={() => onChange(!value)}
								style={styles.keepSignedIn}
							>
								{/* Visual only, so the label and the box are one target
								    rather than a pressable nested inside a pressable. */}
								<View
									accessibilityElementsHidden
									importantForAccessibility="no-hide-descendants"
									pointerEvents="none"
								>
									<Checkbox
										accessibilityLabel="Keep me signed in"
										checked={value === true}
										onChange={onChange}
									/>
								</View>

								<Text style={styles.keepLabel}>Keep me signed in</Text>
							</Pressable>
						)}
					/>

					<Pressable
						accessibilityLabel="Forgot password"
						accessibilityRole="button"
						hitSlop={Spacing.two}
						onPress={handleForgotPassword}
					>
						<Text style={styles.forgot}>Forgot Password?</Text>
					</Pressable>
				</View>

				<View style={styles.submit}>
					<PrimaryButton label="Sign In" loading={isSubmitting} onPress={submit} />
				</View>

				<View style={styles.social}>
					<LabelledDivider label="Sign in with" />
					<SocialAuthRow action="Sign in" onSelect={handleSocial} />
				</View>

				<View style={styles.spacer} />

				<AuthFooterNote
					actionLabel="Sign Up"
					onPress={goToSignUp}
					prompt="Don't have an account?"
					style={styles.footer}
				/>
			</AuthScreenLayout>

			<BiometricsDialog
				busy={isEnrolling}
				kind={biometricKind ?? "biometrics"}
				onEnable={handleEnableBiometrics}
				onSkip={handleSkipBiometrics}
				visible={biometricKind !== null}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	fields: {
		gap: FIELD_GAP,
	},
	optionsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
		marginTop: Spacing.three,
	},
	keepSignedIn: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two + Spacing.one,
	},
	keepLabel: {
		...Type.consent,
		color: Ink.body,
	},
	forgot: {
		...Type.consentLink,
		color: Brand.purple,
	},
	formError: {
		marginTop: Spacing.three,
	},
	submit: {
		marginTop: Spacing.five,
	},
	social: {
		marginTop: Spacing.five + Spacing.two,
		gap: Spacing.four,
	},
	spacer: {
		flex: 1,
		minHeight: Spacing.five,
	},
	footer: {
		marginTop: Spacing.five - Spacing.one,
	},
});
