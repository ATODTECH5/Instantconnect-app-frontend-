import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { OtpInput } from "@/components/auth/otp-input";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Ink, Spacing, Type } from "@/constants/theme";
import { AuthError, resendVerificationCode, verifyEmail } from "@/features/auth/auth-service";

const CODE_LENGTH = 4;

export default function VerifyEmailScreen() {
	const { email } = useLocalSearchParams<{ email?: string }>();

	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);
	const isVerifyingRef = useRef(false);
	const [isResending, setIsResending] = useState(false);
	const [resendNotice, setResendNotice] = useState<string | null>(null);

	// Log in has no destination in the app yet.
	const goToLogIn = useCallback(() => {}, []);

	const handleBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/sign-up");
	}, []);

	const handleChange = useCallback((next: string) => {
		setCode(next);
		setError(null);
		setResendNotice(null);
	}, []);

	const handleVerify = useCallback(
		async (submitted: string) => {
			// Typing the last digit submits, and so does the button, so without this
			// a single verification can run twice and stack two success screens.
			if (isVerifyingRef.current) return;

			if (submitted.length < CODE_LENGTH) {
				setError(`Enter the ${CODE_LENGTH} digit code`);
				return;
			}

			isVerifyingRef.current = true;
			setError(null);
			setIsVerifying(true);

			try {
				await verifyEmail(submitted);
				// Verification is terminal, so the code screen is left behind rather
				// than kept underneath for a back gesture to return to.
				router.replace("/account-created");
			} catch (cause) {
				setError(
					cause instanceof AuthError
						? cause.message
						: "We could not verify that code. Please try again.",
				);
				isVerifyingRef.current = false;
				setIsVerifying(false);
			}
		},
		[],
	);

	const handleResend = useCallback(async () => {
		setError(null);
		setResendNotice(null);
		setIsResending(true);

		try {
			await resendVerificationCode();
			setResendNotice("We sent a new code.");
		} catch {
			setError("We could not send a new code. Please try again.");
		} finally {
			setIsResending(false);
		}
	}, []);

	return (
		<>
			<StatusBar style="light" />

			<AuthScreenLayout
				onBack={handleBack}
				subtitle={
					email ? `We sent a code to ${email}` : "We sent a code to your email address"
				}
				title="Check Your Email"
			>
				<OtpInput
					autoFocus
					editable={!isVerifying}
					error={error ?? undefined}
					length={CODE_LENGTH}
					onChange={handleChange}
					onComplete={handleVerify}
					value={code}
				/>

				<View style={styles.submit}>
					<PrimaryButton
						disabled={code.length < CODE_LENGTH}
						label="Verify Email"
						loading={isVerifying}
						onPress={() => handleVerify(code)}
					/>
				</View>

				<View style={styles.resendRow}>
					<Text style={styles.resendPrompt}>Didn&apos;t receive the email?</Text>

					<Pressable
						accessibilityLabel="Resend code"
						accessibilityRole="button"
						accessibilityState={{ busy: isResending, disabled: isResending }}
						disabled={isResending}
						hitSlop={Spacing.three}
						onPress={handleResend}
					>
						<Text style={[styles.resendAction, isResending && styles.resendBusy]}>
							{isResending ? "Sending…" : "Resend Code"}
						</Text>
					</Pressable>
				</View>

				{resendNotice ? (
					<Text role="alert" style={styles.notice}>
						{resendNotice}
					</Text>
				) : null}

				<View style={styles.spacer} />

				<Text style={styles.footer}>
					Already have an account?{" "}
					<Text accessibilityRole="link" onPress={goToLogIn} style={styles.footerLink}>
						Log in
					</Text>
				</Text>
			</AuthScreenLayout>

			<LoadingOverlay label="Verifying your email" visible={isVerifying} />
		</>
	);
}

const styles = StyleSheet.create({
	submit: {
		marginTop: Spacing.four,
	},
	resendRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		alignItems: "center",
		gap: Spacing.two - Spacing.half,
		marginTop: Spacing.five,
	},
	resendPrompt: {
		...Type.footnote,
		color: Ink.muted,
	},
	resendAction: {
		...Type.footnoteLink,
		color: Brand.purple,
	},
	resendBusy: {
		color: Ink.placeholder,
	},
	notice: {
		...Type.footnote,
		color: Ink.muted,
		textAlign: "center",
		marginTop: Spacing.two,
	},
	spacer: {
		flex: 1,
		minHeight: Spacing.five,
	},
	footer: {
		...Type.footnote,
		color: Ink.muted,
		textAlign: "center",
	},
	footerLink: {
		...Type.footnoteLink,
		color: Brand.purple,
	},
});
