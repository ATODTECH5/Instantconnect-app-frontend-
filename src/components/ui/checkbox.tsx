import { Pressable, StyleSheet, View } from "react-native";

import CheckIcon from "@/assets/auth/check.svg";
import { Brand, Ink, MinTapTarget, Radius, Spacing } from "@/constants/theme";

const BOX_SIZE = 16;
const CHECK_SIZE = 12;

export type CheckboxProps = {
	checked: boolean;
	onChange: (checked: boolean) => void;
	accessibilityLabel: string;
	disabled?: boolean;
};

export function Checkbox({
	checked,
	onChange,
	accessibilityLabel,
	disabled = false,
}: CheckboxProps) {
	return (
		<Pressable
			accessibilityLabel={accessibilityLabel}
			accessibilityRole="checkbox"
			accessibilityState={{ checked, disabled }}
			disabled={disabled}
			hitSlop={(MinTapTarget - BOX_SIZE) / 2}
			onPress={() => onChange(!checked)}
			style={({ pressed }) => [styles.target, pressed && styles.pressed]}
		>
			<View style={[styles.box, checked && styles.boxChecked]}>
				{checked ? (
					<CheckIcon color={Brand.onBrand} height={CHECK_SIZE} width={CHECK_SIZE} />
				) : null}
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	target: {
		paddingVertical: Spacing.one,
		paddingRight: Spacing.one,
	},
	pressed: {
		opacity: 0.6,
	},
	box: {
		width: BOX_SIZE,
		height: BOX_SIZE,
		borderRadius: Radius.checkbox,
		borderWidth: 1,
		borderColor: Ink.borderStrong,
		alignItems: "center",
		justifyContent: "center",
	},
	boxChecked: {
		backgroundColor: Brand.purple,
		borderColor: Brand.purple,
	},
});
