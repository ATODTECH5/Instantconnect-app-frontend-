import { Pressable, StyleSheet, Text } from "react-native";

import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { Brand, BrandGradient, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const SPINNER_SIZE = 18;

export type PrimaryButtonProps = {
	label: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	/** The gradient fill is the frame's treatment wherever the button sits on a photo. */
	tone?: "solid" | "gradient";
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
				tone === "gradient" ? styles.gradient : styles.solid,
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
