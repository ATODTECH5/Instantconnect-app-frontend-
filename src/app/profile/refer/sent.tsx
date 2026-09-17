import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CheckIcon from "@/assets/auth/check.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Brand, BrandGradient, Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";

const EDGE_INSET = Spacing.three;
const RING = 76;
const RING_WIDTH = 5;
const CHECK = 30;

/** Invite Sent (Figma 3051:1603). Reached only after a share left the app. */
export default function ReferSentScreen() {
	const goBack = useCallback(() => router.back(), []);
	const goToProfile = useCallback(() => router.dismissTo("/(tabs)/profile"), []);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Refer a Friend" />

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.ring}>
						<View style={styles.ringInner}>
							<CheckIcon color={Brand.pink} height={CHECK} width={CHECK} />
						</View>
					</View>

					<View style={styles.copy}>
						<Text accessibilityRole="header" style={styles.title}>
							Invite Sent!
						</Text>

						<Text style={styles.body}>
							We&apos;ll notify you when your friend registers. You&apos;ll both
							unlock your priority discover boosts and exclusive profile rewards
							automatically.
						</Text>

						<Text style={styles.nudge}>
							Keep sharing to unlock more local community rewards!
						</Text>
					</View>

					<View style={styles.actions}>
						<PrimaryButton label="Invite More Friends" onPress={goBack} />
						<SecondaryButton
							label="Back to Profile"
							onPress={goToProfile}
							tone="brand"
						/>
					</View>
				</ScrollView>
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
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	content: {
		flexGrow: 1,
		alignItems: "center",
		gap: Spacing.four,
		paddingTop: Spacing.five,
		paddingBottom: Spacing.five,
	},
	ring: {
		...BrandGradient,
		width: RING,
		height: RING,
		borderRadius: RING / 2,
		alignItems: "center",
		justifyContent: "center",
	},
	ringInner: {
		width: RING - RING_WIDTH * 2,
		height: RING - RING_WIDTH * 2,
		borderRadius: (RING - RING_WIDTH * 2) / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surface,
	},
	copy: {
		alignItems: "center",
		gap: Gap.snug,
	},
	title: {
		...Type.successTitle,
		color: Ink.title,
		textAlign: "center",
	},
	body: {
		...Type.slideBody,
		color: Ink.meta,
		textAlign: "center",
	},
	nudge: {
		...Type.consentLink,
		color: Brand.purple,
		textAlign: "center",
	},
	actions: {
		width: "100%",
		gap: Gap.card,
		paddingTop: Spacing.one,
	},
});
