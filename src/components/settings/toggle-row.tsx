import type { FC } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Brand, Gap, Ink, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 20;
const INDENT_LINE = 12;

export type ToggleRowProps = {
	label: string;
	value: boolean;
	onChange: (value: boolean) => void;
	/** Second line under the label, as on Password & Security. */
	description?: string;
	Icon?: FC<SvgProps>;
	/** A child of the row above, drawn with the frame's short indent line. */
	indented?: boolean;
	disabled?: boolean;
	isLast?: boolean;
};

/** A labelled switch on a grouped card, in the Notifications and Security frames' shape. */
export function ToggleRow({
	label,
	value,
	onChange,
	description,
	Icon,
	indented = false,
	disabled = false,
	isLast = false,
}: ToggleRowProps) {
	return (
		<View style={[styles.row, indented && styles.rowIndented, !isLast && styles.divided]}>
			{indented ? <View style={styles.indentLine} /> : null}

			{Icon ? <Icon color={Brand.purple} height={ICON_SIZE} width={ICON_SIZE} /> : null}

			<View style={styles.text}>
				<Text style={[styles.label, indented && styles.labelIndented]}>{label}</Text>

				{description ? <Text style={styles.description}>{description}</Text> : null}
			</View>

			<Switch
				accessibilityLabel={label}
				accessibilityRole="switch"
				accessibilityState={{ checked: value, disabled }}
				disabled={disabled}
				onValueChange={onChange}
				thumbColor={Ink.surface}
				trackColor={{ false: Ink.trackInactive, true: Brand.purple }}
				value={value}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.three - Spacing.half,
	},
	rowIndented: {
		paddingLeft: Spacing.five + Spacing.one,
	},
	divided: {
		borderBottomWidth: 1,
		borderBottomColor: Ink.bubbleIncoming,
	},
	indentLine: {
		width: INDENT_LINE,
		height: 1.5,
		backgroundColor: Brand.purpleTint,
	},
	text: {
		flex: 1,
		gap: Spacing.half,
	},
	label: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.title,
	},
	labelIndented: {
		fontFamily: Type.profileMeta.fontFamily,
		color: Ink.muted,
	},
	description: {
		...Type.cardMeta,
		color: Ink.meta,
	},
});
