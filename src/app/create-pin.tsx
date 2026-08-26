import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { PinInput } from "@/components/auth/pin-input";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Ink, Spacing, Type } from "@/constants/theme";
import { createPin } from "@/features/auth/auth-service";

const PIN_LENGTH = 4;

/** Sequences and single repeated digits are the first thing an attacker tries. */
function isTooPredictable(pin: string) {
	const digits = [...pin].map(Number);
	const allSame = digits.every((digit) => digit === digits[0]);
	const ascending = digits.every(
		(digit, index) => index === 0 || digit === digits[index - 1] + 1,
	);
	const descending = digits.every(
		(digit, index) => index === 0 || digit === digits[index - 1] - 1,
	);

	return allSame || ascending || descending;
}

export default function CreatePinScreen() {
	const [pin, setPin] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const handleBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/account-created");
	}, []);

	const handleChange = useCallback((next: string) => {
		setPin(next);
		setError(null);
	}, []);

	const handleSubmit = useCallback(async () => {
		if (pin.length < PIN_LENGTH) {
			setError(`Enter a ${PIN_LENGTH} digit PIN`);
			return;
		}

		if (isTooPredictable(pin)) {
			setError("Pick a less predictable PIN");
			return;
		}

		setError(null);
		setIsSaving(true);

		try {
			await createPin(pin);
			router.replace("/interests");
		} catch {
			setError("We could not save your PIN. Please try again.");
		} finally {
			setIsSaving(false);
		}
	}, [pin]);

	return (
		<>
			<StatusBar style="light" />

			<AuthScreenLayout onBack={handleBack}>
				<View style={styles.body}>
					<Text accessibilityRole="header" style={styles.title}>
						Create Your Pin
					</Text>

					<Text style={styles.subtitle}>
						Set a {PIN_LENGTH}-digits PIN to secure your account and quick sign in.
					</Text>

					<View style={styles.input}>
						<PinInput
							action={
								<PrimaryButton
									disabled={pin.length < PIN_LENGTH}
									label="Create a secure pin"
									loading={isSaving}
									onPress={handleSubmit}
								/>
							}
							disabled={isSaving}
							error={error ?? undefined}
							length={PIN_LENGTH}
							onChange={handleChange}
							value={pin}
						/>
					</View>
				</View>
			</AuthScreenLayout>

			<LoadingOverlay label="Saving your PIN" visible={isSaving} />
		</>
	);
}

const styles = StyleSheet.create({
	body: {
		paddingTop: Spacing.two,
	},
	title: {
		...Type.successTitle,
		color: Ink.title,
		textAlign: "center",
	},
	subtitle: {
		...Type.successBody,
		color: Ink.muted,
		textAlign: "center",
		marginTop: Spacing.three,
	},
	input: {
		marginTop: Spacing.five,
	},
});
