import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TrashIcon from "@/assets/profile/trash.svg";
import BellIcon from "@/assets/settings/bell.svg";
import LockIcon from "@/assets/settings/lock.svg";
import MailIcon from "@/assets/settings/mail.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { SettingsGroup, SettingsRow } from "@/components/settings/settings-row";
import { Gap, Ink, MaxColumnWidth, Spacing } from "@/constants/theme";

const EDGE_INSET = Spacing.three;

/** Settings (Figma 3064:727). Four rows, the last one destructive. */
export default function SettingsScreen() {
	const goBack = useCallback(() => router.back(), []);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Settings" />

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<SettingsGroup>
						<SettingsRow
							Icon={MailIcon}
							label="Email & Phone Number"
							onPress={() => router.push("/profile/settings/contact")}
						/>

						<SettingsRow
							Icon={LockIcon}
							label="Password & Security"
							onPress={() => router.push("/profile/settings/security")}
						/>

						<SettingsRow
							Icon={BellIcon}
							isLast
							label="Notification"
							onPress={() => router.push("/profile/settings/notifications")}
						/>
					</SettingsGroup>

					<SettingsGroup>
						<SettingsRow
							Icon={TrashIcon}
							isLast
							label="Delete Account"
							onPress={() => router.push("/profile/settings/delete")}
							tone="danger"
						/>
					</SettingsGroup>
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
		gap: Spacing.three,
		paddingTop: Spacing.one,
		paddingBottom: Spacing.five,
	},
});
