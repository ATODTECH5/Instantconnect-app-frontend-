import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { Dialog } from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Ink, Spacing } from "@/constants/theme";

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
		<Dialog
			actions={
				<View style={styles.actions}>
					<View style={styles.action}>
						<PrimaryButton label={cancelLabel} onPress={onCancel} />
					</View>

					<View style={styles.action}>
						<SecondaryButton label={confirmLabel} onPress={onConfirm} tone="danger" />
					</View>
				</View>
			}
			badgeColor={Ink.dangerSurface}
			icon={
				<Svg height={GLYPH_SIZE} viewBox="0 0 24 24" width={GLYPH_SIZE}>
					<Circle
						cx="12"
						cy="12"
						fill="none"
						r="10"
						stroke={Ink.danger}
						strokeWidth="1.6"
					/>
					<Path
						d="M15 9L9 15M9 9L15 15"
						stroke={Ink.danger}
						strokeLinecap="round"
						strokeWidth="1.6"
					/>
				</Svg>
			}
			message={message}
			onDismiss={onCancel}
			title={title}
			visible={visible}
		/>
	);
}

const styles = StyleSheet.create({
	actions: {
		flexDirection: "row",
		gap: Spacing.three - Spacing.one,
	},
	action: {
		flex: 1,
	},
});
