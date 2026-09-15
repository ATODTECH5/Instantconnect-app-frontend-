import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/primary-button";
import { Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { useAuthSession } from "@/features/auth/auth-session";

const EDGE_INSET = Spacing.three;
const EMOJI_SIZE = 44;

/**
 * Settings / Delete Account success (Figma 3086:751). The account is already
 * gone by the time this renders, so there is no back control and the only
 * way out clears the session. Nothing on this screen may call the API.
 */
export default function AccountDeletedScreen() {
	const { endSession } = useAuthSession();
	const [isLeaving, setIsLeaving] = useState(false);

	const done = useCallback(async () => {
		setIsLeaving(true);
		await endSession();
		router.replace("/sign-in");
	}, [endSession]);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<View style={styles.body}>
					<Text accessibilityElementsHidden style={styles.emoji}>
						😞
					</Text>

					<Text accessibilityRole="header" style={styles.title}>
						We&apos;ve Received a Request To Delete Your Account
					</Text>

					<Text style={styles.message}>
						We&apos;re sorry to see you go, but we respect your decision to delete your
						account. Your account is now permanently deactivated.
					</Text>

					<Text style={styles.message}>
						If you ever decide to return, we&apos;ll be here with new updates and
						features to make your experience much better.
					</Text>
				</View>

				<View style={styles.footer}>
					<PrimaryButton label="Done" loading={isLeaving} onPress={() => void done()} />
				</View>
			</View>
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
	},
	body: {
		flex: 1,
		alignItems: "center",
		gap: Spacing.three,
		paddingTop: Spacing.six * 2 + Spacing.five,
		paddingHorizontal: Spacing.two,
	},
	emoji: {
		fontSize: EMOJI_SIZE,
		lineHeight: EMOJI_SIZE + Spacing.two,
	},
	title: {
		...Type.successTitle,
		fontFamily: Type.cta.fontFamily,
		color: Ink.title,
		textAlign: "center",
	},
	message: {
		...Type.profileMeta,
		color: Ink.muted,
		textAlign: "center",
	},
	footer: {
		paddingBottom: Spacing.two,
	},
});
