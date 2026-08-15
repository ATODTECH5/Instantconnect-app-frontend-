import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View, type TextInput } from "react-native";

import { AuthFooterNote } from "@/components/auth/auth-footer-note";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Spacing } from "@/constants/theme";
import { AuthError, setNewPassword } from "@/features/auth/auth-service";
import {
	newPasswordSchema,
	type NewPasswordInput,
	type NewPasswordValues,
} from "@/features/auth/reset-password-schema";

const FIELD_GAP = 22;

const DEFAULT_VALUES: NewPasswordValues = {
	password: "",
	confirmPassword: "",
};

export default function NewPasswordScreen() {
	const { resetToken } = useLocalSearchParams<{ resetToken?: string }>();

	const confirmRef = useRef<TextInput>(null);
	const isSubmittingRef = useRef(false);
	const [formError, setFormError] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<NewPasswordValues, unknown, NewPasswordInput>({
		defaultValues: DEFAULT_VALUES,
		resolver: zodResolver(newPasswordSchema),
		mode: "onTouched",
	});

	const goToSignIn = useCallback(() => router.replace("/sign-in"), []);

	const handleBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/sign-in");
	}, []);

	const onValid = useCallback(
		async (values: NewPasswordInput) => {
			if (isSubmittingRef.current) return;

			// Reaching here without a token means the code step was skipped, and the
			// reset cannot be completed, so send them back rather than fail silently.
			if (!resetToken) {
				setFormError("That reset link has expired. Request a new code to continue.");
				return;
			}

			isSubmittingRef.current = true;
			setFormError(null);

			try {
				await setNewPassword(resetToken, values.password);
				router.replace("/password-changed");
			} catch (cause) {
				setFormError(
					cause instanceof AuthError
						? cause.message
						: "We could not change your password. Please try again.",
				);
			} finally {
				isSubmittingRef.current = false;
			}
		},
		[resetToken],
	);

	const submit = useCallback(() => handleSubmit(onValid)(), [handleSubmit, onValid]);

	return (
		<>
			<StatusBar style="light" />

			<AuthScreenLayout
				onBack={handleBack}
				subtitle="Ensure your new password is different from the previously used password."
				title="Enter New Password"
			>
				<View style={styles.fields}>
					<Controller
						control={control}
						name="password"
						render={({ field: { onChange, onBlur, value } }) => (
							<FormField
								autoCapitalize="none"
								autoComplete="new-password"
								autoFocus
								error={errors.password?.message}
								label="Password"
								onBlur={onBlur}
								onChangeText={onChange}
								onSubmitEditing={() => confirmRef.current?.focus()}
								placeholder="Enter Password"
								returnKeyType="next"
								secure
								textContentType="newPassword"
								value={value}
							/>
						)}
					/>

					<Controller
						control={control}
						name="confirmPassword"
						render={({ field: { onChange, onBlur, value } }) => (
							<FormField
								autoCapitalize="none"
								autoComplete="new-password"
								error={errors.confirmPassword?.message}
								label="Confirm Password"
								onBlur={onBlur}
								onChangeText={onChange}
								onSubmitEditing={submit}
								placeholder="Enter Password"
								ref={confirmRef}
								returnKeyType="go"
								secure
								textContentType="newPassword"
								value={value}
							/>
						)}
					/>
				</View>

				{formError ? (
					<View style={styles.error}>
						<FormErrorBanner message={formError} />
					</View>
				) : null}

				<View style={styles.submit}>
					<PrimaryButton
						label="Set New Password"
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
	fields: {
		gap: FIELD_GAP,
	},
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
