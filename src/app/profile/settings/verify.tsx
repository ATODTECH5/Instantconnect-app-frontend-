import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LockIcon from "@/assets/subscription/lock.svg";
import ShieldCheckIcon from "@/assets/subscription/shield-check.svg";
import { OtpInput } from "@/components/auth/otp-input";
import { ScreenHeader } from "@/components/nav/screen-header";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import {
	confirmAccountDeletion,
	confirmContactChange,
	requestAccountDeletion,
	requestContactChange,
} from "@/features/settings/settings-service";
import { useRefreshAccount } from "@/features/settings/use-settings";
import { describeError } from "@/lib/api/api-error";
import { type DeletionReason, DELETION_REASONS } from "@/lib/api/settings-schema";

const EDGE_INSET = Spacing.three;
const CODE_LENGTH = 4;
const SHIELD_DISC = 80;
const SHIELD_ICON = 40;
const LOCK_ICON = 12;
const RESEND_COOLDOWN_SECONDS = 45;

type Purpose = "email" | "phone" | "deletion";

const TITLES: Record<Purpose, string> = {
	email: "Change Email",
	phone: "Change Phone Number",
	deletion: "Delete Account",
};

function isPurpose(value: unknown): value is Purpose {
	return value === "email" || value === "phone" || value === "deletion";
}

function isDeletionReason(value: unknown): value is DeletionReason {
	return DELETION_REASONS.some((reason) => reason.id === value);
}

function formatCooldown(seconds: number): string {
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * The settings OTP frame (Figma 3075:2581), shared by the email change, the
 * phone change and the deletion. The code was already sent by the screen
 * that pushed here; `value` (or the deletion reason) is carried along only
 * so Resend can ask for it again.
 */
export default function SettingsVerifyScreen() {
	const params = useLocalSearchParams<{
		purpose?: string;
		sentTo?: string;
		value?: string;
		reason?: string;
		details?: string;
	}>();
	const refreshAccount = useRefreshAccount();

	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isConfirming, setIsConfirming] = useState(false);
	const isConfirmingRef = useRef(false);
	const [isResending, setIsResending] = useState(false);
	const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
	const [sentTo, setSentTo] = useState(params.sentTo ?? "");

	const purpose = isPurpose(params.purpose) ? params.purpose : null;
	const goBack = useCallback(() => router.back(), []);

	useEffect(() => {
		if (cooldown <= 0) return;

		const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);

		return () => clearTimeout(timer);
	}, [cooldown]);

	const handleChange = useCallback((next: string) => {
		setCode(next);
		setError(null);
	}, []);

	const confirm = useCallback(
		async (submitted: string) => {
			if (!purpose || isConfirmingRef.current) return;

			if (submitted.length < CODE_LENGTH) {
				setError(`Enter the ${CODE_LENGTH} digit code`);
				return;
			}

			isConfirmingRef.current = true;
			setError(null);
			setIsConfirming(true);

			try {
				if (purpose === "deletion") {
					await confirmAccountDeletion(submitted);
					router.replace("/profile/settings/deleted");
					return;
				}

				await confirmContactChange(purpose, submitted);
				await refreshAccount();
				// Pops this screen (and the change sheet's route) so Back from
				// the contact screen cannot land on a spent code entry.
				router.dismissTo({
					pathname: "/profile/settings/contact",
					params: { saved: purpose },
				});
			} catch (cause) {
				setError(describeError(cause));
				setCode("");
				isConfirmingRef.current = false;
				setIsConfirming(false);
			}
		},
		[purpose, refreshAccount],
	);

	const resend = useCallback(async () => {
		if (!purpose) return;

		setError(null);
		setIsResending(true);

		try {
			if (purpose === "deletion") {
				if (!isDeletionReason(params.reason)) throw new Error("Start the deletion again.");

				const sent = await requestAccountDeletion(params.reason, params.details ?? null);
				setSentTo(sent.sentTo);
			} else {
				if (!params.value) throw new Error("Start the change again.");

				const sent = await requestContactChange(purpose, params.value);
				setSentTo(sent.sentTo);
			}

			setCooldown(RESEND_COOLDOWN_SECONDS);
		} catch (cause) {
			setError(describeError(cause));
		} finally {
			setIsResending(false);
		}
	}, [purpose, params.reason, params.details, params.value]);

	if (!purpose) {
		return (
			<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
				<StatusBar style="dark" />

				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="Verify" />

					<StateMessage
						actionLabel="Back"
						isError
						message="We lost track of what you were verifying. Please start again."
						onPressAction={goBack}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const canResend = !isResending && cooldown <= 0;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title={TITLES[purpose]} />

				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.shield}>
						<View style={styles.shieldDisc}>
							<ShieldCheckIcon
								color={Brand.purple}
								height={SHIELD_ICON}
								width={SHIELD_ICON}
							/>
						</View>

						<Text style={styles.prompt}>
							Enter the OTP sent to <Text style={styles.promptStrong}>{sentTo}</Text>
						</Text>
					</View>

					<OtpInput
						autoFocus
						editable={!isConfirming}
						error={error ?? undefined}
						length={CODE_LENGTH}
						onChange={handleChange}
						onComplete={confirm}
						value={code}
					/>

					<View style={styles.resendRow}>
						<Text style={styles.resendPrompt}>Haven&apos;t received the code?</Text>

						<Pressable
							accessibilityLabel="Resend OTP"
							accessibilityRole="button"
							accessibilityState={{ disabled: !canResend, busy: isResending }}
							disabled={!canResend}
							hitSlop={Spacing.two}
							onPress={() => void resend()}
						>
							<Text style={[styles.resendAction, !canResend && styles.resendMuted]}>
								{isResending ? "Sending…" : "Resend OTP"}
							</Text>
						</Pressable>

						{cooldown > 0 ? (
							<Text style={styles.cooldown}>({formatCooldown(cooldown)})</Text>
						) : null}
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<PrimaryButton
						disabled={code.length < CODE_LENGTH}
						label="Confirm"
						loading={isConfirming}
						onPress={() => void confirm(code)}
						tone={purpose === "deletion" ? "danger" : "solid"}
					/>

					<View style={styles.securityBadge}>
						<LockIcon color={Ink.meta} height={LOCK_ICON} width={LOCK_ICON} />

						<Text style={styles.securityLabel}>Account Security</Text>
					</View>
				</View>
			</View>

			<LoadingOverlay
				label={purpose === "deletion" ? "Deleting your account" : "Checking your code"}
				visible={isConfirming}
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
		flexGrow: 1,
		gap: Gap.card,
		paddingTop: Spacing.one,
		paddingBottom: Spacing.three,
	},
	shield: {
		alignItems: "center",
		gap: Spacing.three,
		paddingVertical: Spacing.four,
	},
	shieldDisc: {
		width: SHIELD_DISC,
		height: SHIELD_DISC,
		borderRadius: SHIELD_DISC / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	prompt: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.muted,
		textAlign: "center",
		paddingHorizontal: Spacing.four,
	},
	promptStrong: {
		fontFamily: Type.planPrice.fontFamily,
		color: Ink.title,
	},
	resendRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		alignItems: "center",
		gap: Spacing.two,
		paddingTop: Spacing.four,
	},
	resendPrompt: {
		...Type.footnote,
		color: Ink.meta,
	},
	resendAction: {
		...Type.footnoteLink,
		color: Brand.purple,
	},
	resendMuted: {
		color: Ink.placeholder,
	},
	cooldown: {
		...Type.footnoteLink,
		color: Brand.orange,
	},
	footer: {
		gap: Spacing.two,
		paddingBottom: Spacing.two,
	},
	securityBadge: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.two,
		padding: Spacing.three - Spacing.one,
	},
	securityLabel: {
		...Type.footnote,
		letterSpacing: 0.2,
		color: Ink.meta,
	},
});
