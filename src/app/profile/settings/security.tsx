import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	type TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import FingerprintIcon from "@/assets/settings/fingerprint.svg";
import ShieldIcon from "@/assets/settings/shield.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { SettingsGroup } from "@/components/settings/settings-row";
import { ToggleRow } from "@/components/settings/toggle-row";
import { FormField } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Toast } from "@/components/ui/toast";
import { Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { passwordSchema } from "@/features/auth/password-rules";
import { changePassword } from "@/features/settings/settings-service";
import { useUpdateSecurity } from "@/features/settings/use-settings";
import { useCurrentUser } from "@/features/user/use-current-user";
import { describeError } from "@/lib/api/api-error";

const EDGE_INSET = Spacing.three;

const formSchema = z
	.object({
		currentPassword: z.string().min(1, "Enter your current password"),
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Re-enter the new password"),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ["confirmPassword"],
		message: "The passwords do not match",
	});

type FormValues = z.infer<typeof formSchema>;

const EMPTY: FormValues = { currentPassword: "", password: "", confirmPassword: "" };

/**
 * Settings / Password & Security (Figma 3068:1862). The password form posts
 * to the server; the two switches are flags on the account. Two-factor is a
 * preference with nothing behind it yet, which the row's copy does not
 * pretend otherwise about.
 */
export default function SecuritySettingsScreen() {
	const user = useCurrentUser();
	const security = useUpdateSecurity();
	const passwordRef = useRef<TextInput>(null);
	const confirmRef = useRef<TextInput>(null);
	const [notice, setNotice] = useState<{ message: string; tone: "success" | "error" } | null>(
		null,
	);
	const goBack = useCallback(() => router.back(), []);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		defaultValues: EMPTY,
		resolver: zodResolver(formSchema),
		mode: "onTouched",
	});

	const submit = handleSubmit(async (values) => {
		setNotice(null);

		try {
			await changePassword(values.currentPassword, values.password);
			reset(EMPTY);
			setNotice({ message: "Your password has been updated", tone: "success" });
		} catch (cause) {
			setNotice({ message: describeError(cause), tone: "error" });
		}
	});

	const toggle = (key: "twoFactorEnabled" | "biometricsEnabled", value: boolean) => {
		security.mutate(
			{ [key]: value },
			{
				onError: (cause) => setNotice({ message: describeError(cause), tone: "error" }),
			},
		);
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.column}
			>
				<ScreenHeader onBack={goBack} title="Password & Security" />

				{notice ? (
					<Toast
						message={notice.message}
						onDismiss={() => setNotice(null)}
						tone={notice.tone}
					/>
				) : null}

				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.card}>
						<Text accessibilityRole="header" style={styles.cardTitle}>
							Change Password
						</Text>

						<Controller
							control={control}
							name="currentPassword"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									autoComplete="current-password"
									error={errors.currentPassword?.message}
									label="Current Password"
									onBlur={onBlur}
									onChangeText={onChange}
									onSubmitEditing={() => passwordRef.current?.focus()}
									returnKeyType="next"
									secure
									textContentType="password"
									value={value}
								/>
							)}
						/>

						<Controller
							control={control}
							name="password"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									autoComplete="new-password"
									error={errors.password?.message}
									label="New Password"
									onBlur={onBlur}
									onChangeText={onChange}
									onSubmitEditing={() => confirmRef.current?.focus()}
									placeholder="Enter new password"
									ref={passwordRef}
									returnKeyType="next"
									secure
									textContentType="newPassword"
									value={value}
								/>
							)}
						/>

						<Controller
							control={control}
							name="confirmPassword"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									autoComplete="new-password"
									error={errors.confirmPassword?.message}
									label="Confirm New Password"
									onBlur={onBlur}
									onChangeText={onChange}
									onSubmitEditing={() => void submit()}
									placeholder="Re-enter new password"
									ref={confirmRef}
									returnKeyType="done"
									secure
									textContentType="newPassword"
									value={value}
								/>
							)}
						/>

						<PrimaryButton
							label="Update Password"
							loading={isSubmitting}
							onPress={() => void submit()}
						/>
					</View>

					<View style={styles.section}>
						<Text accessibilityRole="header" style={styles.sectionLabel}>
							SECURITY PREFERENCES
						</Text>

						<SettingsGroup>
							<ToggleRow
								Icon={ShieldIcon}
								description="Keep your account extra secure"
								disabled={!user.data}
								label="Two-Factor Authentication"
								onChange={(value) => toggle("twoFactorEnabled", value)}
								value={user.data?.twoFactorEnabled ?? false}
							/>

							<ToggleRow
								Icon={FingerprintIcon}
								description="Unlock with Face ID / Fingerprint"
								disabled={!user.data}
								isLast
								label="Biometric Login"
								onChange={(value) => toggle("biometricsEnabled", value)}
								value={user.data?.biometricsEnabled ?? false}
							/>
						</SettingsGroup>
					</View>
				</ScrollView>
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
		gap: Gap.card,
	},
	content: {
		gap: Gap.section,
		paddingTop: Spacing.one,
		paddingBottom: Spacing.five,
	},
	card: {
		gap: Spacing.three + Spacing.one,
		padding: Gap.card,
		paddingTop: Spacing.three,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.keypad,
	},
	cardTitle: {
		...Type.featureTitle,
		color: Ink.title,
	},
	section: {
		gap: Spacing.one,
	},
	sectionLabel: {
		...Type.footnote,
		fontFamily: Type.action.fontFamily,
		color: Ink.meta,
	},
});
