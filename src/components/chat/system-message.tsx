import { StyleSheet, Text, View } from "react-native";

import { Ink, Radius, Spacing, Type } from "@/constants/theme";

/** Written by the server, attributed to nobody, centred between the bubbles. */
export function SystemMessage({ body }: { body: string }) {
	return (
		<View style={styles.row}>
			<Text accessibilityRole="text" style={styles.text}>
				{body}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		alignItems: "center",
		paddingVertical: Spacing.two,
	},
	text: {
		...Type.cardMeta,
		color: Ink.muted,
		backgroundColor: Ink.bubbleIncoming,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
		borderRadius: Radius.pill,
		textAlign: "center",
	},
});
