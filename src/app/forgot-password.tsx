import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AuthFooterNote } from "@/components/auth/auth-footer-note";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Spacing } from "@/constants/theme";
import { AuthError, requestPasswordReset } from "@/features/auth/auth-service";
import {
	forgotPasswordSchema,
	type ForgotPasswordInput,
	type ForgotPasswordValues,
} from "@/features/auth/reset-password-schema";

const DEFAULT_VALUES: ForgotPasswordValues = { email: "" };

export default function ForgotPasswordScreen() {
	const isSubmittingRef = useRef(false);
	const [formError, setFormError] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordValues, unknown, ForgotPasswordInput>({
		defaultValues: DEFAULT_VALUES,
		resolver: zodResolver(forgotPasswordSchema),
		mode: "onTouched",
	});

	const goToSignIn = useCallback(() => router.replace("/sign-in"), []);

	const handleBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/sign-in");
	}, []);

	const onValid = useCallback(async (values: ForgotPasswordInput) => {
		if (isSubmittingRef.current) return;
		isSubmittingRef.current = true;
		setFormError(null);

		try {
			await requestPasswordReset(values.email);
			router.push({ pathname: "/reset-code", params: { email: values.email } });
		} catch (cause) {
			setFormError(
				cause instanceof AuthError
					? cause.message
					: "We could not send a reset link. Please try again.",
			);
		} finally {
			isSubmittingRef.current = false;
		}
	}, []);

	const submit = useCallback(() => handleSubmit(onValid)(), [handleSubmit, onValid]);

	return (
		<>
			<StatusBar style="light" />

			<AuthScreenLayout
				onBack={handleBack}
				subtitle="Enter your email address and we'll send you a reset link."
				title="Forgot Password?"
			>
				<Controller
					control={control}
					name="email"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							autoCapitalize="none"
							autoComplete="email"
							autoFocus
							error={errors.email?.message}
							inputMode="email"
							keyboardType="email-address"
							label="Email"
							onBlur={onBlur}
							onChangeText={onChange}
							onSubmitEditing={submit}
							placeholder="Enter email"
							returnKeyType="send"
							textContentType="emailAddress"
							value={value}
						/>
					)}
				/>

				{formError ? (
					<View style={styles.error}>
						<FormErrorBanner message={formError} />
					</View>
				) : null}

				<View style={styles.submit}>
					<PrimaryButton
						label="Send Reset Link"
						loading={isSubmitting}
						onPress={submit}
					/>
				</View>

				<View style={styles.spacer} />

				<AuthFooterNote
					actionLabel="Log in"
					onPress={goToSignIn}
					prompt="Remember your password?"
				/>
			</AuthScreenLayout>
		</>
	);
}

const styles = StyleSheet.create({
	error: {
		marginTop: Spacing.three,
	},
	submit: {
		marginTop: Spacing.five,
	},
	spacer: {
		flex: 1,
		minHeight: Spacing.five,
	},
});
