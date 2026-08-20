import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AuthFooterNote } from "@/components/auth/auth-footer-note";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { OtpInput } from "@/components/auth/otp-input";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Ink, Spacing, Type } from "@/constants/theme";
import { resendPasswordResetCode, verifyPasswordResetCode } from "@/features/auth/auth-service";
import { describeError } from "@/lib/api/api-error";

const CODE_LENGTH = 4;

export default function ResetCodeScreen() {
	const { email } = useLocalSearchParams<{ email?: string }>();

	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);
	const isVerifyingRef = useRef(false);
	const [isResending, setIsResending] = useState(false);
	const [resendNotice, setResendNotice] = useState<string | null>(null);

	const goToSignIn = useCallback(() => router.replace("/sign-in"), []);

	const handleBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/forgot-password");
	}, []);

	const handleChange = useCallback((next: string) => {
		setCode(next);
		setError(null);
		setResendNotice(null);
	}, []);

	const handleVerify = useCallback(
		async (submitted: string) => {
			// The last digit submits and so does the button, so without this guard one
			// verification can run twice and stack two new password screens.
			if (isVerifyingRef.current) return;

			// The code is only meaningful against the address it was sent to, so
			// arriving without one means the request step was skipped.
			if (!email) {
				setError("We do not know which address to check. Please request a new code.");
				return;
			}

			if (submitted.length < CODE_LENGTH) {
				setError(`Enter the ${CODE_LENGTH} digit code`);
				return;
			}

			isVerifyingRef.current = true;
			setError(null);
			setIsVerifying(true);

			try {
				const { resetToken } = await verifyPasswordResetCode(email, submitted);
				router.replace({ pathname: "/new-password", params: { resetToken } });
			} catch (cause) {
				setError(describeError(cause));
				isVerifyingRef.current = false;
				setIsVerifying(false);
			}
		},
		[email],
	);

	const handleResend = useCallback(async () => {
		if (!email) {
			setError("We do not know which address to send to. Please request a new code.");
			return;
		}

		setError(null);
		setResendNotice(null);
		setIsResending(true);

		try {
			await resendPasswordResetCode(email);
			setResendNotice("We sent a new code.");
		} catch (cause) {
			setError(describeError(cause));
		} finally {
			setIsResending(false);
		}
	}, [email]);

	return (
		<>
			<StatusBar style="light" />

			<AuthScreenLayout
				onBack={handleBack}
				subtitle={
					email
						? `Please enter the ${CODE_LENGTH} digit code sent to ${email}`
						: `Please enter the ${CODE_LENGTH} digit code sent to your email`
				}
				title="Get Your Code"
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
						label="Verify and Proceed"
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

				<AuthFooterNote
					actionLabel="Log in"
					onPress={goToSignIn}
					prompt="Remember your password?"
				/>
			</AuthScreenLayout>

			<LoadingOverlay label="Checking your code" visible={isVerifying} />
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
		marginTop: Spacing.four,
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
});
