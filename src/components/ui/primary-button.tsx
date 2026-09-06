import { Pressable, StyleSheet, Text } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { GradientSpinner } from "@/components/ui/gradient-spinner";
import {
	Brand,
	BrandGradient,
	Ink,
	MinTapTarget,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";

const SPINNER_SIZE = 18;

export type PrimaryButtonTone = "solid" | "gradient" | "danger";

export type PrimaryButtonProps = {
	label: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	/** The gradient fill is the frame's treatment wherever the button sits on a photo. */
	tone?: PrimaryButtonTone;
	accessibilityHint?: string;
};

export function PrimaryButton({
	label,
	onPress,
	disabled = false,
	loading = false,
	tone = "solid",
	accessibilityHint,
}: PrimaryButtonProps) {
	const isInert = disabled || loading;

	return (
		<Pressable
			accessibilityHint={accessibilityHint}
			accessibilityLabel={label}
			accessibilityRole="button"
			accessibilityState={{ disabled: isInert, busy: loading }}
			disabled={isInert}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				TONE_STYLE[tone],
				disabled && styles.disabled,
				pressed && !isInert && styles.pressed,
			]}
		>
			{loading ? (
				<GradientSpinner size={SPINNER_SIZE} />
			) : (
				<Text style={styles.label}>{label}</Text>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		minHeight: MinTapTarget,
		paddingVertical: Spacing.two,
		paddingHorizontal: Spacing.four,
		borderRadius: Radius.control,
		alignItems: "center",
		justifyContent: "center",
	},
	solid: {
		backgroundColor: Brand.purple,
	},
	danger: {
		backgroundColor: Ink.danger,
	},
	gradient: {
		...BrandGradient,
	},
	disabled: {
		opacity: 0.45,
	},
	pressed: {
		opacity: 0.85,
	},
	label: {
		...Type.cta,
		color: Brand.onBrand,
		textAlign: "center",
	},
});

const TONE_STYLE: Record<PrimaryButtonTone, StyleProp<ViewStyle>> = {
	solid: styles.solid,
	gradient: styles.gradient,
	danger: styles.danger,
};
