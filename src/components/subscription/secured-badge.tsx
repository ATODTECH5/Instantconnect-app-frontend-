import { StyleSheet, Text, View } from "react-native";

import LockIcon from "@/assets/subscription/lock.svg";
import { Ink, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 12;

const PAYMENT_LABEL = "Your payment is secured with 256-bit encryption";

/** The lock line under every payment CTA, and under every KYC one with its own wording. */
export function SecuredBadge({ label = PAYMENT_LABEL }: { label?: string }) {
	return (
		<View style={styles.row}>
			<LockIcon color={Ink.meta} height={ICON_SIZE} width={ICON_SIZE} />

			<Text style={styles.label}>{label}</Text>
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
