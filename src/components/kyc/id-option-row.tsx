import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const DISC_SIZE = 40;
const ICON_SIZE = 22;
const RADIO_SIZE = 20;

export type IdOptionRowProps = {
	Icon: FC<SvgProps>;
	label: string;
	description: string;
	selected: boolean;
	onPress: () => void;
};

/** The passport or licence card on the ID frame: icon disc, two lines, a radio. */
export function IdOptionRow({ Icon, label, description, selected, onPress }: IdOptionRowProps) {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="radio"
			accessibilityState={{ checked: selected }}
			onPress={onPress}
			style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && styles.pressed]}
		>
			<View style={styles.disc}>
				<Icon color={Brand.purple} height={ICON_SIZE} width={ICON_SIZE} />
			</View>

			<View style={styles.text}>
				<Text style={styles.label}>{label}</Text>
				<Text style={styles.description}>{description}</Text>
			</View>

			<View style={[styles.radio, selected && styles.radioSelected]} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget,
		padding: Spacing.three,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.surface,
	},
	rowSelected: {
		borderColor: Brand.purple,
	},
	pressed: {
		opacity: 0.8,
	},
	disc: {
		width: DISC_SIZE,
		height: DISC_SIZE,
		borderRadius: Radius.control,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	text: {
		flex: 1,
		gap: Spacing.half,
	},
	label: {
		...Type.noticeTitle,
		color: Ink.title,
	},
	description: {
		...Type.footnote,
		color: Ink.meta,
	},
	radio: {
		width: RADIO_SIZE,
		height: RADIO_SIZE,
		borderRadius: RADIO_SIZE / 2,
		borderWidth: 1.5,
		borderColor: Ink.borderStrong,
	},
	radioSelected: {
		borderColor: Brand.purple,
		backgroundColor: Brand.purple,
	},
});
