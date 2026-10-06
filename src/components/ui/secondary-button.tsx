import { Pressable, StyleSheet, Text } from "react-native";

import { SINGLE_LINE_MIN_SCALE } from "@/components/ui/primary-button";
import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

/** `brand` is the purple outline under a purple primary, as on Invite Sent. */
export type SecondaryButtonTone = "neutral" | "danger" | "brand";

export type SecondaryButtonProps = {
	label: string;
	onPress: () => void;
	tone?: SecondaryButtonTone;
	disabled?: boolean;
	accessibilityHint?: string;
	/** For buttons sharing a row: tighter padding, and the label shrinks before it wraps. */
	singleLine?: boolean;
};

/** Outlined counterpart to `PrimaryButton`, for the declining half of a pair. */
export function SecondaryButton({
	label,
	onPress,
	tone = "neutral",
	disabled = false,
	accessibilityHint,
	singleLine = false,
}: SecondaryButtonProps) {
	const isDanger = tone === "danger";
	const isBrand = tone === "brand";

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
				isDanger ? styles.danger : isBrand ? styles.brand : styles.neutral,
				singleLine && styles.singleLine,
				disabled && styles.disabled,
				pressed && !disabled && styles.pressed,
			]}
		>
			<Text
				adjustsFontSizeToFit={singleLine}
				minimumFontScale={SINGLE_LINE_MIN_SCALE}
				numberOfLines={singleLine ? 1 : undefined}
				style={[styles.label, isDanger && styles.dangerLabel, isBrand && styles.brandLabel]}
			>
				{label}
			</Text>
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
	singleLine: {
		paddingHorizontal: Spacing.two,
	},
	neutral: {
		borderWidth: 0.5,
		borderColor: Ink.placeholder,
	},
	danger: {
		borderWidth: 1.5,
		borderColor: Ink.danger,
	},
	brand: {
		borderWidth: 1,
		borderColor: Brand.purple,
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
	brandLabel: {
		color: Brand.purple,
	},
});
