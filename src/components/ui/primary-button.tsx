import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { Brand, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

export type PrimaryButtonProps = {
	label: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	accessibilityHint?: string;
};

export function PrimaryButton({
	label,
	onPress,
	disabled = false,
	loading = false,
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
				disabled && styles.disabled,
				pressed && !isInert && styles.pressed,
			]}
		>
			{loading ? (
				<ActivityIndicator color={Brand.onBrand} />
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
		backgroundColor: Brand.purple,
		alignItems: "center",
		justifyContent: "center",
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
