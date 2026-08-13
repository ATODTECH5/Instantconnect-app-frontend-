import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/gradient-background";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectableRow } from "@/components/ui/selectable-row";
import { Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { saveInterests } from "@/features/auth/auth-service";
import { INTERESTS } from "@/features/auth/interests";
import { useDesignScale } from "@/hooks/use-design-scale";

/** Vertical rhythm from the artboard, tightened on shorter screens. */
const GAP = {
	afterTitle: 12,
	beforeCard: 42,
} as const;

export default function InterestsScreen() {
	const insets = useSafeAreaInsets();
	const { vertical } = useDesignScale();

	const [selected, setSelected] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const toggle = useCallback((id: string) => {
		setError(null);
		setSelected((current) =>
			current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
		);
	}, []);

	const handleConfirm = useCallback(async () => {
		if (selected.length === 0) {
			setError("Pick at least one category");
			return;
		}

		setError(null);
		setIsSaving(true);

		try {
			await saveInterests(selected);
			router.replace("/(tabs)");
		} catch {
			setError("We could not save your choices. Please try again.");
		} finally {
			setIsSaving(false);
		}
	}, [selected]);

	return (
		<GradientBackground style={styles.screen}>
			<StatusBar style="light" />

			<ScrollView
				contentContainerStyle={[
					styles.content,
					{
						paddingTop: insets.top + Spacing.five * vertical,
						paddingBottom: insets.bottom + Spacing.four,
					},
				]}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.column}>
					<Text accessibilityRole="header" style={styles.title}>
						What are you into?
					</Text>

					<Text style={[styles.subtitle, { marginTop: GAP.afterTitle * vertical }]}>
						Pick categories that interest you so we can personalize your experience
					</Text>

					<View style={[styles.card, { marginTop: GAP.beforeCard * vertical }]}>
						{INTERESTS.map(({ id, label }) => (
							<SelectableRow
								disabled={isSaving}
								key={id}
								label={label}
								onToggle={() => toggle(id)}
								selected={selected.includes(id)}
							/>
						))}
					</View>

					{error ? (
						<Text role="alert" style={styles.error}>
							{error}
						</Text>
					) : null}

					<View style={styles.spacer} />

					<PrimaryButton
						accessibilityHint="Saves your categories and opens the app"
						disabled={isSaving}
						label="Confirm"
						loading={isSaving}
						onPress={handleConfirm}
					/>
				</View>
			</ScrollView>

			<LoadingOverlay label="Saving your categories" visible={isSaving} />
		</GradientBackground>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		alignItems: "center",
		paddingHorizontal: Spacing.three,
	},
	column: {
		flexGrow: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
	},
	title: {
		...Type.authTitle,
		color: Ink.surface,
		textAlign: "center",
	},
	subtitle: {
		...Type.authSubtitle,
		color: Ink.onBrandMuted,
		textAlign: "center",
	},
	card: {
		gap: Spacing.two + Spacing.half,
		padding: Spacing.three - Spacing.half,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.surface,
	},
	error: {
		...Type.fieldError,
		color: Ink.surface,
		textAlign: "center",
		marginTop: Spacing.three,
	},
	spacer: {
		flex: 1,
		minHeight: Spacing.five,
	},
});
