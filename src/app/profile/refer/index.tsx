import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { PerksCard } from "@/components/referrals/perks-card";
import { ReferralHero } from "@/components/referrals/referral-hero";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";

const EDGE_INSET = Spacing.three;

/** Refer a Friend intro (Figma 3051:997). The share screen holds the code itself. */
export default function ReferScreen() {
	const goBack = useCallback(() => router.back(), []);
	const invite = useCallback(() => router.push("/profile/refer/share"), []);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Refer a Friend" />

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<ReferralHero />

					<Text style={styles.lead}>
						When friends join using your special invite code, both of you unlock unique
						social perks to boost your presence!
					</Text>

					<PerksCard />

					<View style={styles.footer}>
						<PrimaryButton label="Invite Friends" onPress={invite} />
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
		gap: Spacing.four,
		paddingTop: Spacing.one,
		paddingBottom: Spacing.five,
	},
	lead: {
		...Type.slideBody,
		color: Ink.muted,
	},
	footer: {
		paddingTop: Spacing.one,
	},
});
