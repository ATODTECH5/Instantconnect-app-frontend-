import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ArrowLeftIcon from "@/assets/auth/arrow-left.svg";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Brand, Ink, MaxColumnWidth, MinTapTarget, Spacing, Type } from "@/constants/theme";
import { createAccount } from "@/features/auth/auth-service";
import { useSignUpDraft } from "@/features/auth/sign-up-draft";
import { TERMS } from "@/features/legal/terms";
import { describeError } from "@/lib/api/api-error";

const BACK_SIZE = 44;
const ICON_SIZE = 24;

/** Agree is the wider half, matching the 227 to 127.5 split on the artboard. */
const AGREE_FLEX = 227;
const DISAGREE_FLEX = 127.5;

export default function TermsScreen() {
	const insets = useSafeAreaInsets();
	const { draft, clearDraft } = useSignUpDraft();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isConfirmingExit, setIsConfirmingExit] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const offset = useSharedValue(0);
	const contentHeight = useSharedValue(0);
	const viewportHeight = useSharedValue(0);

	const handleScroll = useAnimatedScrollHandler((event) => {
		offset.value = event.contentOffset.y;
	});

	const goBackToForm = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/sign-up");
	}, []);

	const handleAgree = useCallback(async () => {
		// Opened from the link on the form rather than by submitting it, so there
		// is nothing to create yet and agreeing just returns.
		if (!draft) {
			goBackToForm();
			return;
		}

		setSubmitError(null);
		setIsSubmitting(true);

		try {
			const { email } = await createAccount(draft);
			clearDraft();
			router.replace({ pathname: "/verify-email", params: { email } });
		} catch (cause) {
			setSubmitError(describeError(cause));
		} finally {
			setIsSubmitting(false);
		}
	}, [clearDraft, draft, goBackToForm]);

	const handleExitSignUp = useCallback(() => {
		setIsConfirmingExit(false);
		clearDraft();
		goBackToForm();
	}, [clearDraft, goBackToForm]);

	return (
		<View style={styles.screen}>
			<StatusBar style="dark" />

			<View style={[styles.column, { paddingTop: insets.top + Spacing.one }]}>
				<View style={styles.topBar}>
					<Pressable
						accessibilityLabel="Go back"
						accessibilityRole="button"
						onPress={goBackToForm}
						style={({ pressed }) => [styles.back, pressed && styles.pressed]}
					>
						<ArrowLeftIcon color={Ink.title} height={ICON_SIZE} width={ICON_SIZE} />
					</Pressable>

					<Pressable
						accessibilityLabel="Get help"
						accessibilityRole="button"
						hitSlop={Spacing.three}
						onPress={() => {}}
						style={({ pressed }) => pressed && styles.pressed}
					>
						<Text style={styles.help}>Help</Text>
					</Pressable>
				</View>

				<View style={styles.notice}>
					<Text style={styles.noticeTitle}>Hello, 👋</Text>
					<Text style={styles.noticeBody}>
						Before you create an account, please read our terms and conditions
					</Text>
				</View>

				<View style={styles.documentArea}>
					<Animated.ScrollView
						contentContainerStyle={styles.document}
						onContentSizeChange={(_width, height) => {
							contentHeight.value = height;
						}}
						onLayout={(event) => {
							viewportHeight.value = event.nativeEvent.layout.height;
						}}
						onScroll={handleScroll}
						scrollEventThrottle={16}
						showsVerticalScrollIndicator={false}
					>
						<Text accessibilityRole="header" style={styles.docTitle}>
							{TERMS.title}
						</Text>

						<Text style={styles.docMeta}>Last updated: {TERMS.lastUpdated}</Text>

						{TERMS.sections.map((section, index) => (
							<View key={section.id} style={styles.section}>
								<Text accessibilityRole="header" style={styles.sectionHeading}>
									{index + 1}. {section.heading}
								</Text>

								{section.paragraphs.map((paragraph) => (
									<Text key={paragraph.slice(0, 32)} style={styles.paragraph}>
										{paragraph}
									</Text>
								))}
							</View>
						))}
					</Animated.ScrollView>

					<ScrollIndicator
						contentHeight={contentHeight}
						offset={offset}
						viewportHeight={viewportHeight}
					/>
				</View>

				{submitError ? (
					<Text role="alert" style={styles.error}>
						{submitError}
					</Text>
				) : null}

				<View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.one }]}>
					<View style={{ flex: DISAGREE_FLEX }}>
						<SecondaryButton
							disabled={isSubmitting}
							label="Disagree"
							onPress={() => setIsConfirmingExit(true)}
						/>
					</View>

					<View style={{ flex: AGREE_FLEX }}>
						<PrimaryButton
							accessibilityHint="Creates your account"
							disabled={isSubmitting}
							label="Agree"
							onPress={handleAgree}
						/>
					</View>
				</View>
			</View>

			<ConfirmDialog
				cancelLabel="Go Back"
				confirmLabel="Exit Sign Up"
				message="By disagreeing, you won't be able to create an account and join our community."
				onCancel={() => setIsConfirmingExit(false)}
				onConfirm={handleExitSignUp}
				title="Are you sure?"
				visible={isConfirmingExit}
			/>

			<LoadingOverlay label="Creating your account" visible={isSubmitting} />
		</View>
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
	},
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: Spacing.three,
	},
	back: {
		width: BACK_SIZE,
		height: BACK_SIZE,
		borderRadius: BACK_SIZE / 2,
		backgroundColor: Ink.glassOnLight,
		alignItems: "center",
		justifyContent: "center",
	},
	pressed: {
		opacity: 0.6,
	},
	help: {
		...Type.action,
		color: Brand.purple,
		minHeight: MinTapTarget - Spacing.four,
	},
	notice: {
		marginTop: Spacing.two,
		marginHorizontal: Spacing.three,
		padding: Spacing.three,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	noticeTitle: {
		...Type.noticeTitle,
		color: Ink.title,
	},
	noticeBody: {
		...Type.consent,
		color: Ink.body,
		marginTop: Spacing.two,
	},
	documentArea: {
		flex: 1,
		marginTop: Spacing.four,
		paddingRight: Spacing.three,
	},
	document: {
		paddingLeft: Spacing.three,
		paddingRight: Spacing.two,
		paddingBottom: Spacing.four,
	},
	docTitle: {
		...Type.docTitle,
		color: Ink.title,
	},
	docMeta: {
		...Type.footnote,
		color: Ink.muted,
		marginTop: Spacing.two,
	},
	section: {
		marginTop: Spacing.four,
		gap: Spacing.two + Spacing.one,
	},
	sectionHeading: {
		...Type.docSection,
		color: Brand.purple,
	},
	paragraph: {
		...Type.docBody,
		color: Ink.body,
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
		marginHorizontal: Spacing.three,
		marginTop: Spacing.two,
	},
	actions: {
		flexDirection: "row",
		gap: Spacing.two - Spacing.half,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.three,
	},
});
