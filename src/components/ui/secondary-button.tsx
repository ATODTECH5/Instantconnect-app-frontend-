import { Pressable, StyleSheet, Text } from "react-native";

import { Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

export type SecondaryButtonTone = "neutral" | "danger";

export type SecondaryButtonProps = {
	label: string;
	onPress: () => void;
	tone?: SecondaryButtonTone;
	disabled?: boolean;
	accessibilityHint?: string;
};

/** Outlined counterpart to `PrimaryButton`, for the declining half of a pair. */
export function SecondaryButton({
	label,
	onPress,
	tone = "neutral",
	disabled = false,
	accessibilityHint,
}: SecondaryButtonProps) {
	const isDanger = tone === "danger";

	return (
		<Pressable
			accessibilityHint={accessibilityHint}
			accessibilityLabel={label}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				isDanger ? styles.danger : styles.neutral,
				disabled && styles.disabled,
				pressed && !disabled && styles.pressed,
			]}
		>
			<Text style={[styles.label, isDanger && styles.dangerLabel]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		minHeight: MinTapTarget,
		paddingVertical: Spacing.two,
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.control,
		backgroundColor: Ink.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	neutral: {
		borderWidth: 0.5,
		borderColor: Ink.placeholder,
	},
	danger: {
		borderWidth: 1.5,
		borderColor: Ink.danger,
	},
	disabled: {
		opacity: 0.45,
	},
	pressed: {
		opacity: 0.7,
	},
	label: {
		...Type.cta,
		color: Ink.body,
		textAlign: "center",
	},
	dangerLabel: {
		color: Ink.danger,
	},
});
