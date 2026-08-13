import { Pressable, StyleSheet, Text, View } from "react-native";

import CheckIcon from "@/assets/auth/check.svg";
import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const BOX_SIZE = 24;
const CHECK_SIZE = 15;

export type SelectableRowProps = {
	label: string;
	selected: boolean;
	onToggle: () => void;
	disabled?: boolean;
};

/**
 * The artboard keeps the tick visible when unselected, white on the pale box,
 * so the row reads as a slot waiting to be filled rather than an empty square.
 */
export function SelectableRow({ label, selected, onToggle, disabled = false }: SelectableRowProps) {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="checkbox"
			accessibilityState={{ checked: selected, disabled }}
			disabled={disabled}
			onPress={onToggle}
			style={({ pressed }) => [styles.row, pressed && !disabled && styles.pressed]}
		>
			<View style={[styles.box, selected && styles.boxSelected]}>
				<CheckIcon color={Brand.onBrand} height={CHECK_SIZE} width={CHECK_SIZE} />
			</View>

			<Text style={styles.label}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.three,
		minHeight: MinTapTarget,
		paddingHorizontal: Spacing.three - Spacing.half,
		paddingVertical: Spacing.two,
		borderWidth: 0.5,
		borderColor: Ink.rowBorder,
		borderRadius: Radius.control,
		backgroundColor: Ink.surface,
	},
	pressed: {
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	box: {
		width: BOX_SIZE,
		height: BOX_SIZE,
		borderRadius: Radius.codeBox,
		backgroundColor: Ink.keypad,
		alignItems: "center",
		justifyContent: "center",
	},
	boxSelected: {
		backgroundColor: Brand.purple,
	},
	label: {
		...Type.optionLabel,
		flex: 1,
		color: Ink.body,
	},
});
