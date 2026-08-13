import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View, type TextInput } from "react-native";

import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { SocialAuthRow, type SocialProvider } from "@/components/auth/social-auth-row";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { LabelledDivider } from "@/components/ui/labelled-divider";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Ink, Spacing, Type } from "@/constants/theme";
import { signUpSchema, type SignUpInput, type SignUpValues } from "@/features/auth/sign-up-schema";

const FIELD_GAP = 22;

const DEFAULT_VALUES: SignUpValues = {
	fullName: "",
	email: "",
	phone: "",
	password: "",
	termsAccepted: false,
};

export default function SignUpScreen() {
	const emailRef = useRef<TextInput>(null);
	const phoneRef = useRef<TextInput>(null);
	const passwordRef = useRef<TextInput>(null);

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignUpValues, unknown, SignUpInput>({
		defaultValues: DEFAULT_VALUES,
		resolver: zodResolver(signUpSchema),
		mode: "onTouched",
	});

	const handleBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/get-started");
	}, []);

	const submit = handleSubmit(
		useCallback((_values: SignUpInput) => {
			router.replace("/(tabs)");
		}, []),
	);

	// Terms, social providers and log in have no destination in the app yet, so
	// these stay inert rather than pushing routes that would fail to resolve.
	const handleSocial = useCallback((_provider: SocialProvider) => {}, []);
	const openTerms = useCallback(() => {}, []);
	const goToLogIn = useCallback(() => {}, []);

	return (
		<>
			<StatusBar style="light" />
			<AuthScreenLayout
				onBack={handleBack}
				subtitle="Join us today and start connecting with real people nearby."
				title="Create Account"
			>
				<View style={styles.fields}>
					<Controller
						control={control}
						name="fullName"
						render={({ field: { onChange, onBlur, value } }) => (
							<FormField
								autoCapitalize="words"
								autoComplete="name"
								error={errors.fullName?.message}
								label="Full Name"
								onBlur={onBlur}
								onChangeText={onChange}
								onSubmitEditing={() => emailRef.current?.focus()}
								placeholder="Enter full name"
								returnKeyType="next"
								textContentType="name"
								value={value}
							/>
						)}
					/>

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
								onSubmitEditing={() => phoneRef.current?.focus()}
								placeholder="Enter email"
								ref={emailRef}
								returnKeyType="next"
								textContentType="emailAddress"
								value={value}
							/>
						)}
					/>

					<Controller
						control={control}
						name="phone"
						render={({ field: { onChange, onBlur, value } }) => (
							<FormField
								autoComplete="tel"
								error={errors.phone?.message}
								inputMode="tel"
								keyboardType="phone-pad"
								label="Phone No"
								onBlur={onBlur}
								onChangeText={onChange}
								onSubmitEditing={() => passwordRef.current?.focus()}
								placeholder="Enter phone no"
								ref={phoneRef}
								returnKeyType="next"
								textContentType="telephoneNumber"
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
								autoComplete="new-password"
								error={errors.password?.message}
								label="Password"
								onBlur={onBlur}
								onChangeText={onChange}
								onSubmitEditing={submit}
								placeholder="Enter Password"
								ref={passwordRef}
								returnKeyType="go"
								secure
								textContentType="newPassword"
								value={value}
							/>
						)}
					/>
				</View>

				<Controller
					control={control}
					name="termsAccepted"
					render={({ field: { onChange, value } }) => (
						<View style={styles.consent}>
							<Checkbox
								accessibilityLabel="Agree to the terms and conditions"
								checked={value === true}
								onChange={onChange}
							/>

							<Text style={styles.consentText}>
								By signing up, you agree to our{" "}
								<Text
									accessibilityRole="link"
									onPress={openTerms}
									style={styles.consentLink}
								>
									Terms &amp; Conditions
								</Text>
							</Text>
						</View>
					)}
				/>

				{errors.termsAccepted ? (
					<Text role="alert" style={styles.consentError}>
						{errors.termsAccepted.message}
					</Text>
				) : null}

				<View style={styles.submit}>
					<PrimaryButton
						label="Sign Up"
						loading={isSubmitting}
						onPress={submit}
					/>
				</View>

				<View style={styles.social}>
					<LabelledDivider label="Sign up with" />
					<SocialAuthRow action="Sign up" onSelect={handleSocial} />
				</View>

				<Text style={styles.footer}>
					Already have an account?{" "}
					<Text accessibilityRole="link" onPress={goToLogIn} style={styles.footerLink}>
						Log in
					</Text>
				</Text>
			</AuthScreenLayout>
		</>
	);
}

const styles = StyleSheet.create({
	fields: {
		gap: FIELD_GAP,
	},
	consent: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two + Spacing.one,
		marginTop: Spacing.three,
	},
	consentText: {
		...Type.consent,
		flex: 1,
		color: Ink.body,
	},
	consentLink: {
		...Type.consentLink,
		color: Brand.purple,
		textDecorationLine: "underline",
	},
	consentError: {
		...Type.fieldError,
		color: Ink.danger,
		marginTop: Spacing.one + Spacing.half,
	},
	submit: {
		marginTop: Spacing.five,
	},
	social: {
		marginTop: Spacing.five + Spacing.two,
		gap: Spacing.four,
	},
	footer: {
		...Type.consent,
		color: Ink.placeholder,
		textAlign: "center",
		marginTop: Spacing.five - Spacing.one,
	},
	footerLink: {
		...Type.consentLink,
		color: Brand.purple,
	},
});
