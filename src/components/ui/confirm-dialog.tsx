import { Modal, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";

const BADGE_SIZE = 64;
const GLYPH_SIZE = 32;

export type ConfirmDialogProps = {
	visible: boolean;
	title: string;
	message: string;
	confirmLabel: string;
	cancelLabel: string;
	/** Dismisses the dialog and keeps the user where they are. */
	onCancel: () => void;
	/** Carries out the destructive choice the dialog is warning about. */
	onConfirm: () => void;
};

/**
 * Destructive confirmation. `onCancel` is the safe path, so it takes the
 * primary button and the hardware back gesture.
 */
export function ConfirmDialog({
	visible,
	title,
	message,
	confirmLabel,
	cancelLabel,
	onCancel,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<Modal
			animationType="fade"
			onRequestClose={onCancel}
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<View style={styles.scrim}>
				<View accessibilityViewIsModal accessibilityRole="alert" style={styles.dialog}>
					<View style={styles.badge}>
						<Svg height={GLYPH_SIZE} width={GLYPH_SIZE} viewBox="0 0 24 24">
							<Circle
								cx="12"
								cy="12"
								r="10"
								stroke={Ink.danger}
								strokeWidth="1.6"
								fill="none"
							/>
							<Path
								d="M15 9L9 15M9 9L15 15"
								stroke={Ink.danger}
								strokeLinecap="round"
								strokeWidth="1.6"
							/>
						</Svg>
					</View>

					<Text accessibilityRole="header" style={styles.title}>
						{title}
					</Text>

					<Text style={styles.message}>{message}</Text>

					<View style={styles.actions}>
						<View style={styles.action}>
							<PrimaryButton label={cancelLabel} onPress={onCancel} />
						</View>

						<View style={styles.action}>
							<SecondaryButton label={confirmLabel} onPress={onConfirm} tone="danger" />
						</View>
					</View>
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
		backgroundColor: Ink.dangerSurface,
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
		flexDirection: "row",
		gap: Spacing.three - Spacing.one,
		marginTop: Spacing.five,
		alignSelf: "stretch",
	},
	action: {
		flex: 1,
	},
});
