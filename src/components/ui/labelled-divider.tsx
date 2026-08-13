import { StyleSheet, Text, View } from "react-native";

import { Ink, Spacing, Type } from "@/constants/theme";

export function LabelledDivider({ label }: { label: string }) {
	return (
		<View accessibilityRole="header" style={styles.row}>
			<View style={styles.rule} />
			<Text style={styles.label}>{label}</Text>
			<View style={styles.rule} />
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.three,
	},
	rule: {
		flex: 1,
		height: 1,
		backgroundColor: Ink.border,
	},
	label: {
		...Type.dividerLabel,
		color: Ink.placeholder,
	},
});
