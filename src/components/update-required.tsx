import { Linking, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandWordmark } from "@/components/brand-wordmark";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import type { AppRelease } from "@/features/app-release/app-release";
import { useUpdateRequired } from "@/features/app-release/use-update-required";

/**
 * Covers the whole app when this version is older than the server's minimum.
 * There is deliberately no way past it: the server may already require
 * things this version cannot send.
 */
export function UpdateRequired({ release }: { release: AppRelease }) {
	const storeUrl = Platform.OS === "ios" ? release.appStoreUrl : release.playStoreUrl;
	const storeName = Platform.OS === "ios" ? "the App Store" : "Google Play";

	return (
		<View style={styles.cover}>
			<SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
				<View style={styles.column}>
					<BrandWordmark style={styles.wordmark} />

					<Text accessibilityRole="header" style={styles.title}>
						Update required
					</Text>

					<Text style={styles.body}>
						This version of Instant Connect is no longer supported. Update to the latest
						version from {storeName} to keep using the app.
					</Text>

					{storeUrl ? (
						<PrimaryButton
							label="Update Now"
							onPress={() => void Linking.openURL(storeUrl).catch(() => undefined)}
							tone="gradient"
						/>
					) : null}
				</View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	cover: {
		...StyleSheet.absoluteFill,
		backgroundColor: Ink.surface,
	},
	safe: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
	},
	column: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		alignItems: "stretch",
		gap: Spacing.three,
	},
	wordmark: {
		color: Brand.purple,
	},
	title: {
		...Type.dialogTitle,
		color: Ink.title,
		textAlign: "center",
	},
	body: {
		...Type.dialogBody,
		color: Ink.muted,
		textAlign: "center",
	},
});

/** Renders nothing unless the server says this version must update. */
export function UpdateGate() {
	const release = useUpdateRequired();

	return release ? <UpdateRequired release={release} /> : null;
}
