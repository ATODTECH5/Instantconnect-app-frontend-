import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MailIcon from "@/assets/settings/mail.svg";
import PhoneIcon from "@/assets/settings/phone.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ContactCard } from "@/components/settings/contact-card";
import { InfoNotice } from "@/components/settings/info-notice";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { FormField } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Toast } from "@/components/ui/toast";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { type ContactChange, requestContactChange } from "@/features/settings/settings-service";
import { useCurrentUser } from "@/features/user/use-current-user";
import { describeError } from "@/lib/api/api-error";

const EDGE_INSET = Spacing.three;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Local 0XXXXXXXXXX or international +234XXXXXXXXXX, matching the server. */
const NIGERIAN_PHONE = /^(?:0|\+?234)(?:7[01]|8[01]|9[01])\d{8}$/;

/** "ada.lovelace@example.com" → "ada***@example.com", as the frame masks it. */
function maskEmail(email: string): string {
	const [local, domain] = email.split("@");

	return `${local.slice(0, 3)}***@${domain}`;
}

/** "+2348031234521" → "+234 *** *** 4521". */
function maskPhone(phone: string): string {
	return `${phone.slice(0, 4)} *** *** ${phone.slice(-4)}`;
}

const SHEET_COPY: Record<
	ContactChange,
	{ title: string; message: string; label: string; placeholder: string }
> = {
	email: {
		title: "Enter a new email address",
		message:
			"Please enter a new email address you would like to associate with your account below.",
		label: "New email address",
		placeholder: "name@example.com",
	},
	phone: {
		title: "Enter a new phone number",
		message:
			"Please enter the new phone number you would like to associate with your account below.",
		label: "New phone number",
		placeholder: "0803 123 4567",
	},
};

/**
 * Email & Phone Number (Figma 3067:1475) with the Change Email and Change
 * Phone Number sheets (3075:2642, 3075:2736). Either sheet asks the server
 * for a code and hands off to the shared verify screen; it returns here with
 * `saved` set so the confirmation banner shows.
 */
export default function ContactSettingsScreen() {
	const { saved } = useLocalSearchParams<{ saved?: string }>();
	const user = useCurrentUser();
	const [sheet, setSheet] = useState<ContactChange | null>(null);
	const [draft, setDraft] = useState("");
	const [draftError, setDraftError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);
	// The banner is derived from the `saved` param the verify screen hands
	// back, and is hidden by remembering which value was dismissed.
	const [dismissedSaved, setDismissedSaved] = useState<string | undefined>(undefined);
	const notice =
		saved && saved !== dismissedSaved
			? saved === "email"
				? "Your email has been updated"
				: "Your phone number has been updated"
			: null;
	const goBack = useCallback(() => router.back(), []);

	const openSheet = (kind: ContactChange) => {
		setDraft("");
		setDraftError(null);
		setSheet(kind);
	};

	const closeSheet = () => {
		if (isSending) return;
		setSheet(null);
	};

	const submit = async () => {
		if (!sheet) return;

		const value = draft.trim();
		const isValid =
			sheet === "email"
				? EMAIL.test(value)
				: NIGERIAN_PHONE.test(value.replace(/[\s()-]/g, ""));

		if (!isValid) {
			setDraftError(
				sheet === "email"
					? "Enter a valid email address"
					: "Enter a valid Nigerian phone number",
			);
			return;
		}

		setDraftError(null);
		setIsSending(true);

		try {
			const { sentTo } = await requestContactChange(sheet, value);
			setSheet(null);
			router.push({
				pathname: "/profile/settings/verify",
				params: { purpose: sheet, sentTo, value },
			});
		} catch (cause) {
			setDraftError(describeError(cause));
		} finally {
			setIsSending(false);
		}
	};

	const copy = sheet ? SHEET_COPY[sheet] : null;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Email & Phone Number" />

				{notice ? (
					<Toast message={notice} onDismiss={() => setDismissedSaved(saved)} />
				) : null}

				{user.isPending ? (
					<StateMessage message="Loading your details…" />
				) : user.isError || !user.data ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(user.error)}
						onPressAction={() => void user.refetch()}
					/>
				) : (
					<ScrollView
						contentContainerStyle={styles.content}
						showsVerticalScrollIndicator={false}
					>
						<Text style={styles.intro}>
							Manage your registered contact details. These are used for security
							verification and account recovery.
						</Text>

						<ContactCard
							Icon={MailIcon}
							actionLabel="Change Email"
							caption="Current Email"
							isVerified={user.data.isEmailVerified}
							onPressAction={() => openSheet("email")}
							title="Email Address"
							value={maskEmail(user.data.email)}
						/>

						<ContactCard
							Icon={PhoneIcon}
							actionLabel="Change Phone Number"
							caption="Current Phone Number"
							isVerified
							onPressAction={() => openSheet("phone")}
							title="Phone Number"
							value={maskPhone(user.data.phone)}
						/>

						<InfoNotice message="For security reasons, changing either details will require multi-factor verification. A secure One-Time Password (OTP) will be sent to your existing and new contact points." />
					</ScrollView>
				)}
			</View>

			<BottomSheet
				actions={
					<>
						<PrimaryButton
							disabled={draft.trim().length === 0}
							label="Confirm"
							loading={isSending}
							onPress={() => void submit()}
						/>

						<SecondaryButton disabled={isSending} label="Cancel" onPress={closeSheet} />
					</>
				}
				message={copy?.message ?? ""}
				onDismiss={closeSheet}
				title={copy?.title ?? ""}
				visible={sheet !== null}
			>
				{copy ? (
					<View style={styles.sheetField}>
						<FormField
							autoCapitalize="none"
							autoComplete={sheet === "email" ? "email" : "tel"}
							autoCorrect={false}
							autoFocus
							editable={!isSending}
							error={draftError ?? undefined}
							keyboardType={sheet === "email" ? "email-address" : "phone-pad"}
							label={copy.label}
							onChangeText={(text) => {
								setDraft(text);
								setDraftError(null);
							}}
							onSubmitEditing={() => void submit()}
							placeholder={copy.placeholder}
							returnKeyType="done"
							value={draft}
						/>
					</View>
				) : null}
			</BottomSheet>
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
		gap: Gap.section,
		paddingTop: Spacing.one,
		paddingBottom: Spacing.five,
	},
	intro: {
		...Type.profileMeta,
		color: Ink.muted,
	},
	sheetField: {
		alignSelf: "stretch",
		paddingTop: Spacing.two,
	},
});
