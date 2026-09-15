import { StyleSheet, Text, View } from "react-native";

import LockIcon from "@/assets/subscription/lock.svg";
import { Ink, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 12;

/** The lock line under every payment CTA. */
export function SecuredBadge() {
	return (
		<View style={styles.row}>
			<LockIcon color={Ink.meta} height={ICON_SIZE} width={ICON_SIZE} />

			<Text style={styles.label}>Your payment is secured with 256-bit encryption</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.two,
		padding: Spacing.three - Spacing.one,
	},
	label: {
		...Type.footnote,
		letterSpacing: 0.2,
		color: Ink.meta,
	},
});
