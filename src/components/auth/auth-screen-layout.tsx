import type { ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ArrowLeftIcon from "@/assets/auth/arrow-left.svg";
import { GradientBackground } from "@/components/gradient-background";
import { GlassIconButton } from "@/components/ui/glass-icon-button";
import { Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { useDesignScale } from "@/hooks/use-design-scale";

/** Vertical rhythm from the artboard, tightened on shorter screens. */
const GAP = {
	afterBack: 41,
	afterTitle: 12,
	beforeSheet: 26,
} as const;

const SHEET_PADDING_TOP = 40;

export type AuthScreenLayoutProps = {
	title: string;
	subtitle: string;
	onBack: () => void;
	backLabel?: string;
	children: ReactNode;
};

/**
 * Brand gradient header over a rounded white sheet, shared by every screen in
 * the auth flow. The header scrolls with the sheet so the whole form stays
 * reachable on short devices and behind the keyboard.
 */
export function AuthScreenLayout({
	title,
	subtitle,
	onBack,
	backLabel = "Go back",
	children,
}: AuthScreenLayoutProps) {
	const insets = useSafeAreaInsets();
	const { vertical, height } = useDesignScale();

	return (
		<GradientBackground style={styles.screen}>
			<ScrollView
				automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.column}>
					<View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
						<GlassIconButton
							Icon={ArrowLeftIcon}
							accessibilityLabel={backLabel}
							onPress={onBack}
						/>

						<Text
							accessibilityRole="header"
							style={[styles.title, { marginTop: GAP.afterBack * vertical }]}
						>
							{title}
						</Text>

						<Text style={[styles.subtitle, { marginTop: GAP.afterTitle * vertical }]}>
							{subtitle}
						</Text>
					</View>

					<View
						style={[
							styles.sheet,
							{
								marginTop: GAP.beforeSheet * vertical,
								paddingBottom: insets.bottom + Spacing.four,
							},
						]}
					>
						{children}

						{/*
						 * The sheet stops at its content, so bouncing past the end or
						 * opening the keyboard would otherwise expose the gradient
						 * underneath it.
						 */}
						<View style={[styles.sheetUnderlay, { height, bottom: -height }]} />
					</View>
				</View>
			</ScrollView>
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
	},
	column: {
		flexGrow: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
	},
	header: {
		paddingHorizontal: Spacing.three,
	},
	title: {
		...Type.authTitle,
		color: Ink.surface,
	},
	subtitle: {
		...Type.authSubtitle,
		color: Ink.onBrandMuted,
	},
	sheet: {
		flexGrow: 1,
		paddingTop: SHEET_PADDING_TOP,
		paddingHorizontal: Spacing.three,
		borderTopLeftRadius: Radius.sheet,
		borderTopRightRadius: Radius.sheet,
		backgroundColor: Ink.surface,
	},
	sheetUnderlay: {
		position: "absolute",
		left: 0,
		right: 0,
		backgroundColor: Ink.surface,
	},
});
