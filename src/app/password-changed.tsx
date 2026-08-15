import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { SuccessBadge } from "@/components/auth/success-badge";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Ink, Spacing, Type } from "@/constants/theme";

export default function PasswordChangedScreen() {
	const handleContinue = useCallback(() => router.replace("/sign-in"), []);

	return (
		<>
			<StatusBar style="light" />

			{/* No back button: the password has already changed, so every earlier
			    step is spent and returning to the form would be a dead end. */}
			<AuthScreenLayout headerContent={<SuccessBadge />}>
				<View style={styles.body}>
					<Text accessibilityRole="header" style={styles.title}>
						Password Changed
					</Text>

					<Text style={styles.message}>
						Your password has been successfully changed. You can now sign in with your
						new password.
					</Text>

					<View style={styles.action}>
						<PrimaryButton label="Back to Sign In" onPress={handleContinue} />
					</View>
				</View>
			</AuthScreenLayout>
		</>
	);
}

const styles = StyleSheet.create({
	body: {
		paddingTop: Spacing.five,
	},
	title: {
		...Type.successTitle,
		color: Ink.title,
		textAlign: "center",
	},
	message: {
		...Type.successBody,
		color: Ink.body,
		textAlign: "center",
		marginTop: Spacing.three,
	},
	action: {
		marginTop: Spacing.five + Spacing.two,
	},
});
