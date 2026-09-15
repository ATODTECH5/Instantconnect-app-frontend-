import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Brand, Gap, Ink, Spacing, Type } from "@/constants/theme";

const ROW_HEIGHT = 60;
const ICON_BASE = 40;
const ICON_SIZE = 22;
const RADIO_SIZE = 20;
const RADIO_DOT = 10;

export type PaymentMethodRowProps = {
	Icon: FC<SvgProps>;
	label: string;
	selected: boolean;
	onPress: () => void;
};

/**
 * The selected row lifts onto the pale purple surface with a purple icon
 * base; the rest stay white with a grey base, as the frame draws them.
 */
export function PaymentMethodRow({ Icon, label, selected, onPress }: PaymentMethodRowProps) {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="radio"
			accessibilityState={{ checked: selected }}
			onPress={onPress}
			style={({ pressed }) => [
				styles.row,
				selected && styles.rowSelected,
				pressed && !selected && styles.pressed,
			]}
		>
			<View style={styles.lead}>
				<View style={[styles.iconBase, selected && styles.iconBaseSelected]}>
					<Icon
						color={selected ? Brand.onBrand : Ink.meta}
						height={ICON_SIZE}
						width={ICON_SIZE}
					/>
				</View>

				<Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>
					{label}
				</Text>
			</View>

			<View style={[styles.radio, selected && styles.radioSelected]}>
				{selected ? <View style={styles.radioDot} /> : null}
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
		minHeight: ROW_HEIGHT,
		paddingHorizontal: Spacing.three,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Gap.snug,
		backgroundColor: Ink.surface,
	},
	rowSelected: {
		borderColor: Brand.purple,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	lead: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		flexShrink: 1,
	},
	iconBase: {
		width: ICON_BASE,
		height: ICON_BASE,
		borderRadius: Gap.snug,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.keypad,
	},
	iconBaseSelected: {
		backgroundColor: Brand.purple,
	},
	label: {
		...Type.chipLabel,
		fontFamily: Type.action.fontFamily,
		flexShrink: 1,
		color: Ink.muted,
	},
	labelSelected: {
		fontFamily: Type.cta.fontFamily,
		color: Ink.title,
	},
	radio: {
		width: RADIO_SIZE,
		height: RADIO_SIZE,
		borderRadius: RADIO_SIZE / 2,
		borderWidth: 1,
		borderColor: Ink.placeholder,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surface,
	},
	radioSelected: {
		borderWidth: 1.25,
		borderColor: Brand.purple,
	},
	radioDot: {
		width: RADIO_DOT,
		height: RADIO_DOT,
		borderRadius: RADIO_DOT / 2,
		backgroundColor: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
