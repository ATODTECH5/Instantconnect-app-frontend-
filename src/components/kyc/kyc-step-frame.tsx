import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, type ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { SecuredBadge } from "@/components/subscription/secured-badge";
import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { KYC_STEP_COUNT } from "@/features/kyc/options";

const EDGE_INSET = Spacing.three;
const BAR_HEIGHT = 6;

export const KYC_SECURE_LABEL = "Your information will be encrypted and secure";

export type KycStepFrameProps = {
	step: number;
	headerTitle: string;
	title: string;
	subtitle: string;
	children: ReactNode;
	/** The CTA and anything under it, such as the selfie's Retake link. */
	footer: ReactNode;
	scrollable?: boolean;
};

/**
 * The chrome every step frame shares: STEP n OF 4 pill, the four segment
 * progress bar, the title pair, and the lock line above the CTA.
 */
export function KycStepFrame({
	step,
	headerTitle,
	title,
	subtitle,
	children,
	footer,
	scrollable = true,
}: KycStepFrameProps) {
	const goBack = useCallback(() => router.back(), []);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.column}
			>
				<ScreenHeader
					onBack={goBack}
					title={headerTitle}
					trailing={
						<View
							accessibilityLabel={`Step ${step} of ${KYC_STEP_COUNT}`}
							accessibilityRole="text"
							style={styles.pill}
						>
							<Text style={styles.pillLabel}>
								STEP {step} OF {KYC_STEP_COUNT}
							</Text>
						</View>
					}
				/>

				<View
					accessibilityLabel={`Step ${step} of ${KYC_STEP_COUNT}`}
					accessibilityRole="progressbar"
					accessibilityValue={{ min: 0, max: KYC_STEP_COUNT, now: step }}
					style={styles.bar}
				>
					{Array.from({ length: KYC_STEP_COUNT }, (_, index) => (
						<View
							key={index}
							style={[styles.segment, index < step && styles.segmentDone]}
						/>
					))}
				</View>

				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
					scrollEnabled={scrollable}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.titles}>
						<Text accessibilityRole="header" style={styles.title}>
							{title}
						</Text>
						<Text style={styles.subtitle}>{subtitle}</Text>
					</View>

					{children}
				</ScrollView>

				<View style={styles.footer}>
					<SecuredBadge label={KYC_SECURE_LABEL} />

					{footer}
				</View>
			</KeyboardAvoidingView>
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
	},
	pill: {
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.one,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurface,
	},
	pillLabel: {
		...Type.tagLabel,
		color: Brand.purple,
	},
	bar: {
		flexDirection: "row",
		gap: Spacing.two,
		marginTop: Spacing.three,
	},
	segment: {
		flex: 1,
		height: BAR_HEIGHT,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurface,
	},
	segmentDone: {
		backgroundColor: Brand.purple,
	},
	content: {
		flexGrow: 1,
		gap: Spacing.four,
		paddingTop: Spacing.four,
		paddingBottom: Spacing.three,
	},
	titles: {
		gap: Spacing.one,
	},
	title: {
		...Type.docTitle,
		color: Ink.title,
	},
	subtitle: {
		...Type.profileMeta,
		color: Ink.meta,
	},
	footer: {
		gap: Spacing.one,
		paddingBottom: Spacing.two,
	},
});
