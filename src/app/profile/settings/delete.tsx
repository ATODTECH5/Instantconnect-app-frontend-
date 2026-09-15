import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AlertTriangleIcon from "@/assets/settings/alert-triangle.svg";
import ChevronDownIcon from "@/assets/settings/chevron-down.svg";
import XCircleIcon from "@/assets/settings/x-circle.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ReasonSheet } from "@/components/settings/reason-sheet";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Toast } from "@/components/ui/toast";
import { Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { useProfile } from "@/features/profile/use-profile";
import { requestAccountDeletion } from "@/features/settings/settings-service";
import { describeError } from "@/lib/api/api-error";
import { type DeletionReason, DELETION_REASONS } from "@/lib/api/settings-schema";

const EDGE_INSET = Spacing.three;
const WARNING_DISC = 56;
const WARNING_ICON = 28;
const IMPACT_ICON = 16;
const CHEVRON_SIZE = 16;

/** The frame's Danger/600 and /500, which the theme has no name for yet. */
const DANGER_TITLE = "#B41313";
const DANGER_BODY = "#C92B2B";
const DANGER_SURFACE = "#FEF2F2";
const DANGER_DISC = "#FEE2E2";

/**
 * Settings / Delete Account (Figma 3075:2422) with the reason sheet
 * (3075:2930). "Delete My Account" opens the sheet; Ok on the sheet asks the
 * server for a code and hands off to the verify screen. Nothing is deleted
 * until that code is confirmed.
 */
export default function DeleteAccountScreen() {
	const profile = useProfile();
	const [sheetOpen, setSheetOpen] = useState(false);
	const [reason, setReason] = useState<DeletionReason | null>(null);
	const [details, setDetails] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const goBack = useCallback(() => router.back(), []);

	const connections = profile.data?.stats.connections ?? 0;
	const reasonLabel = DELETION_REASONS.find((option) => option.id === reason)?.label;

	const submit = async () => {
		if (!reason) return;

		setIsSending(true);
		setError(null);

		try {
			const trimmed = details.trim();
			const { sentTo } = await requestAccountDeletion(reason, trimmed || null);
			setSheetOpen(false);
			router.push({
				pathname: "/profile/settings/verify",
				params: { purpose: "deletion", sentTo, reason, details: trimmed },
			});
		} catch (cause) {
			setSheetOpen(false);
			setError(describeError(cause));
		} finally {
			setIsSending(false);
		}
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Delete Account" />

				{error ? (
					<Toast message={error} onDismiss={() => setError(null)} tone="error" />
				) : null}

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.warning}>
						<View style={styles.warningDisc}>
							<AlertTriangleIcon
								color={Ink.badge}
								height={WARNING_ICON}
								width={WARNING_ICON}
							/>
						</View>

						<View style={styles.warningText}>
							<Text accessibilityRole="header" style={styles.warningTitle}>
								Are you sure?
							</Text>

							<Text style={styles.warningBody}>
								This action is permanent and your account cannot be recovered.
							</Text>
						</View>
					</View>

					<View style={styles.impact}>
						<Text style={styles.impactTitle}>If you delete your account:</Text>

						<View style={styles.impactList}>
							{[
								"Your profile, events, and personal settings will be permanently removed.",
								`All of your ${connections} active connection${connections === 1 ? "" : "s"} and chat histories will be immediately lost.`,
								"Any active subscription plans will be canceled without refunds.",
							].map((line) => (
								<View key={line} style={styles.impactRow}>
									<View style={styles.impactIcon}>
										<XCircleIcon
											color={Ink.badge}
											height={IMPACT_ICON}
											width={IMPACT_ICON}
										/>
									</View>

									<Text style={styles.impactLine}>{line}</Text>
								</View>
							))}
						</View>
					</View>

					<View style={styles.reason}>
						<Text style={styles.reasonLabel}>Why are you leaving?</Text>

						<Pressable
							accessibilityHint="Opens the list of reasons"
							accessibilityLabel={
								reasonLabel ? `Reason: ${reasonLabel}` : "Select a reason"
							}
							accessibilityRole="button"
							onPress={() => setSheetOpen(true)}
							style={({ pressed }) => [styles.dropdown, pressed && styles.pressed]}
						>
							<Text
								numberOfLines={1}
								style={[styles.dropdownValue, reasonLabel && styles.dropdownChosen]}
							>
								{reasonLabel ?? "Select a reason..."}
							</Text>

							<ChevronDownIcon
								color={Ink.placeholder}
								height={CHEVRON_SIZE}
								width={CHEVRON_SIZE}
							/>
						</Pressable>
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<PrimaryButton
						label="Delete My Account"
						onPress={() => setSheetOpen(true)}
						tone="danger"
					/>

					<Pressable
						accessibilityLabel="Cancel and Keep Account"
						accessibilityRole="button"
						hitSlop={Spacing.two}
						onPress={goBack}
						style={({ pressed }) => [styles.keep, pressed && styles.pressed]}
					>
						<Text style={styles.keepLabel}>Cancel and Keep Account</Text>
					</Pressable>
				</View>
			</View>

			<ReasonSheet
				details={details}
				isSubmitting={isSending}
				onChangeDetails={setDetails}
				onChangeReason={setReason}
				onDismiss={() => {
					if (!isSending) setSheetOpen(false);
				}}
				onSubmit={() => void submit()}
				reason={reason}
				visible={sheetOpen}
			/>
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
		gap: Spacing.four,
		paddingTop: Spacing.three,
		paddingBottom: Spacing.four,
	},
	warning: {
		alignItems: "center",
		gap: Spacing.three,
		padding: Gap.section,
		borderRadius: Radius.dialog,
		backgroundColor: DANGER_SURFACE,
	},
	warningDisc: {
		width: WARNING_DISC,
		height: WARNING_DISC,
		borderRadius: WARNING_DISC / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: DANGER_DISC,
	},
	warningText: {
		alignItems: "center",
		gap: Gap.tight,
	},
	warningTitle: {
		...Type.subtitle,
		color: DANGER_TITLE,
		textAlign: "center",
	},
	warningBody: {
		...Type.profileMeta,
		color: DANGER_BODY,
		textAlign: "center",
	},
	impact: {
		gap: Spacing.three,
		padding: Gap.card,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.keypad,
	},
	impactTitle: {
		...Type.profileMeta,
		fontFamily: Type.cta.fontFamily,
		color: Ink.body,
	},
	impactList: {
		gap: Gap.card,
	},
	impactRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Gap.card,
	},
	impactIcon: {
		width: 20,
		height: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	impactLine: {
		...Type.resultMeta,
		flex: 1,
		color: Ink.muted,
	},
	reason: {
		gap: Spacing.two,
	},
	reasonLabel: {
		...Type.footnote,
		fontFamily: Type.cta.fontFamily,
		color: Ink.body,
	},
	dropdown: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
		minHeight: 48,
		padding: Gap.card,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.control,
		backgroundColor: Ink.keypad,
	},
	dropdownValue: {
		...Type.footnote,
		flexShrink: 1,
		color: Ink.meta,
	},
	dropdownChosen: {
		...Type.profileMeta,
		color: Ink.title,
	},
	footer: {
		gap: Gap.card,
		paddingBottom: Spacing.two,
	},
	keep: {
		alignSelf: "center",
		paddingVertical: Spacing.one,
	},
	keepLabel: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.muted,
	},
	pressed: {
		opacity: 0.7,
	},
});
