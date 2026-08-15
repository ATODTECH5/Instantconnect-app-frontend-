import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Dialog } from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Ink, MinTapTarget, Spacing, Type } from "@/constants/theme";
import { BIOMETRIC_LABEL, type BiometricKind } from "@/features/auth/biometrics";

const GLYPH_SIZE = 40;

export type BiometricsDialogProps = {
	visible: boolean;
	kind: BiometricKind;
	busy?: boolean;
	onEnable: () => void;
	onSkip: () => void;
};

export function BiometricsDialog({
	visible,
	kind,
	busy = false,
	onEnable,
	onSkip,
}: BiometricsDialogProps) {
	return (
		<Dialog
			actions={
				<View style={styles.actions}>
					<PrimaryButton label="Enable Biometrics" loading={busy} onPress={onEnable} />

					<Pressable
						accessibilityLabel="Maybe later"
						accessibilityRole="button"
						accessibilityState={{ disabled: busy }}
						disabled={busy}
						onPress={onSkip}
						style={({ pressed }) => [styles.skip, pressed && !busy && styles.pressed]}
					>
						<Text style={styles.skipLabel}>Maybe Later</Text>
					</Pressable>
				</View>
			}
			icon={
				<Svg height={GLYPH_SIZE} viewBox="0 0 24 24" width={GLYPH_SIZE}>
					<Path
						d="M12 4a7 7 0 0 0-7 7v2M12 4a7 7 0 0 1 7 7v3M8.5 11a3.5 3.5 0 1 1 7 0v5M12 11v7M15.5 18.5v1.5M8.5 14v4"
						fill="none"
						stroke={Ink.title}
						strokeLinecap="round"
						strokeWidth="1.4"
					/>
				</Svg>
			}
			message={`Add your ${BIOMETRIC_LABEL[kind]} to access your account easily and securely.`}
			onDismiss={onSkip}
			title="Enable Biometrics"
			visible={visible}
		/>
	);
}

const styles = StyleSheet.create({
	actions: {
		gap: Spacing.two,
	},
	skip: {
		minHeight: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
	},
	pressed: {
		opacity: 0.6,
	},
	skipLabel: {
		...Type.cta,
		color: Ink.muted,
	},
});
