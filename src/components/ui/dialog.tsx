import type { ReactNode } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

import { Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";

const BADGE_SIZE = 64;

export type DialogProps = {
	visible: boolean;
	title: string;
	message: string;
	/** Icon shown above the title, optionally inside a tinted disc. */
	icon: ReactNode;
	badgeColor?: string;
	/** Buttons, laid out by the caller since dialogs differ in arrangement. */
	actions: ReactNode;
	/** Runs on the hardware back gesture, so it must be the safe choice. */
	onDismiss: () => void;
};

/** Scrim, card and header shared by every modal dialog in the app. */
export function Dialog({
	visible,
	title,
	message,
	icon,
	badgeColor,
	actions,
	onDismiss,
}: DialogProps) {
	return (
		<Modal
			animationType="fade"
			onRequestClose={onDismiss}
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<View style={styles.scrim}>
				<View accessibilityRole="alert" accessibilityViewIsModal style={styles.dialog}>
					<View
						style={[styles.badge, badgeColor ? { backgroundColor: badgeColor } : null]}
					>
						{icon}
					</View>

					<Text accessibilityRole="header" style={styles.title}>
						{title}
					</Text>

					<Text style={styles.message}>{message}</Text>

					<View style={styles.actions}>{actions}</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	scrim: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
		backgroundColor: Ink.scrim,
	},
	dialog: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		padding: Spacing.four,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.surface,
		alignItems: "center",
	},
	badge: {
		width: BADGE_SIZE,
		height: BADGE_SIZE,
		borderRadius: BADGE_SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		...Type.dialogTitle,
		color: Ink.title,
		textAlign: "center",
		marginTop: Spacing.four,
	},
	message: {
		...Type.dialogBody,
		color: Ink.muted,
		textAlign: "center",
		marginTop: Spacing.two + Spacing.one,
	},
	actions: {
		marginTop: Spacing.five,
		alignSelf: "stretch",
	},
});
