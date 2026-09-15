import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { SettingsGroup } from "@/components/settings/settings-row";
import { ToggleRow } from "@/components/settings/toggle-row";
import { StateMessage } from "@/components/ui/state-message";
import { Toast } from "@/components/ui/toast";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import {
	useNotificationPreferences,
	useUpdateNotificationPreferences,
} from "@/features/settings/use-settings";
import { describeError } from "@/lib/api/api-error";
import type { NotificationPreferenceKey } from "@/lib/api/settings-schema";

const EDGE_INSET = Spacing.three;

type Section = {
	title: string;
	/** The switch that gates the ones below it. */
	master: { key: NotificationPreferenceKey; label: string };
	children: { key: NotificationPreferenceKey; label: string }[];
};

/** The three groups on the frame, in its order and wording. */
const SECTIONS: Section[] = [
	{
		title: "PUSH NOTIFICATIONS",
		master: { key: "pushEnabled", label: "Enable Push Notifications" },
		children: [
			{ key: "pushEventReminders", label: "Event Reminders" },
			{ key: "pushNewConnections", label: "New Connections" },
			{ key: "pushMessages", label: "Messages" },
			{ key: "pushCommunityUpdates", label: "Community Updates" },
		],
	},
	{
		title: "EMAIL NOTIFICATIONS",
		master: { key: "emailEnabled", label: "Enable Email Notifications" },
		children: [
			{ key: "emailEventInvites", label: "Event Invites" },
			{ key: "emailWeeklyDigest", label: "Weekly Digest" },
			{ key: "emailPromotions", label: "Promotions" },
		],
	},
	{
		title: "IN-APP EXPERIENCE",
		master: { key: "inAppEnabled", label: "In-App Notifications" },
		children: [],
	},
];

/**
 * Settings / Notifications (Figma 3068:2197). Every switch writes straight
 * through; the cache flips first so the switch never lags the thumb. A
 * child switch is greyed while its master is off, since the server ignores
 * it in that state.
 */
export default function NotificationSettingsScreen() {
	const preferences = useNotificationPreferences();
	const update = useUpdateNotificationPreferences();
	const [error, setError] = useState<string | null>(null);
	const goBack = useCallback(() => router.back(), []);

	const set = (key: NotificationPreferenceKey, value: boolean) => {
		setError(null);
		update.mutate({ [key]: value }, { onError: (cause) => setError(describeError(cause)) });
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Notifications" />

				{error ? (
					<Toast message={error} onDismiss={() => setError(null)} tone="error" />
				) : null}

				{preferences.isPending ? (
					<StateMessage message="Loading your preferences…" />
				) : preferences.isError || !preferences.data ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(preferences.error)}
						onPressAction={() => void preferences.refetch()}
					/>
				) : (
					<ScrollView
						contentContainerStyle={styles.content}
						showsVerticalScrollIndicator={false}
					>
						{SECTIONS.map((section) => {
							const data = preferences.data;
							const masterOn = data[section.master.key];

							return (
								<View key={section.title} style={styles.section}>
									<Text accessibilityRole="header" style={styles.sectionTitle}>
										{section.title}
									</Text>

									<SettingsGroup>
										<ToggleRow
											isLast={section.children.length === 0}
											label={section.master.label}
											onChange={(value) => set(section.master.key, value)}
											value={masterOn}
										/>

										{section.children.map((child, index) => (
											<ToggleRow
												disabled={!masterOn}
												indented
												isLast={index === section.children.length - 1}
												key={child.key}
												label={child.label}
												onChange={(value) => set(child.key, value)}
												value={data[child.key]}
											/>
										))}
									</SettingsGroup>
								</View>
							);
						})}
					</ScrollView>
				)}
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
	section: {
		gap: Gap.tight,
	},
	sectionTitle: {
		...Type.footnote,
		fontFamily: Type.cta.fontFamily,
		color: Ink.meta,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		paddingBottom: Spacing.one,
	},
});
