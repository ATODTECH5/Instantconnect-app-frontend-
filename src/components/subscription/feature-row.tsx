import { StyleSheet, Text, View } from "react-native";

import CheckIcon from "@/assets/auth/check.svg";
import { Brand, Gap, Ink, Spacing, Type } from "@/constants/theme";

const DISC_SIZE = 24;
const CHECK_SIZE = 14;

/** One "What's Included" line: a purple tick on a pale disc, then the feature. */
export function FeatureRow({ label }: { label: string }) {
	return (
		<View accessibilityLabel={`Included: ${label}`} style={styles.row}>
			<View style={styles.disc}>
				<CheckIcon color={Brand.purple} height={CHECK_SIZE} width={CHECK_SIZE} />
			</View>

			<Text style={styles.label}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		paddingVertical: Spacing.one,
	},
	disc: {
		width: DISC_SIZE,
		height: DISC_SIZE,
		borderRadius: DISC_SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	label: {
		...Type.detailRole,
		fontFamily: Type.action.fontFamily,
		flex: 1,
		color: Ink.muted,
	},
});
