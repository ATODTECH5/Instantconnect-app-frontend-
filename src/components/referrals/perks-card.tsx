import { StyleSheet, Text, View } from "react-native";

import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import { REFERRAL_PERKS } from "@/features/referrals/perks";

const DISC = 32;
const ICON = 14;

/** The "WHAT YOU BOTH UNLOCK" card on the Refer a Friend intro (Figma 3051:1042). */
export function PerksCard() {
	return (
		<View style={styles.card}>
			<Text style={styles.heading}>What you both unlock</Text>

			<View style={styles.list}>
				{REFERRAL_PERKS.map(({ id, Icon, label }) => (
					<View key={id} style={styles.row}>
						<View style={styles.disc}>
							<Icon color={Brand.purple} height={ICON} width={ICON} />
						</View>

						<Text style={styles.label}>{label}</Text>
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Spacing.three,
		padding: Gap.card,
		borderRadius: Radius.media,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	heading: {
		...Type.overline,
		fontFamily: Type.cta.fontFamily,
		fontSize: 13,
		color: Brand.purple,
		textTransform: "uppercase",
	},
	list: {
		gap: 14,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
	},
	disc: {
		width: DISC,
		height: DISC,
		borderRadius: DISC / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	label: {
		...Type.featureBody,
		fontFamily: Type.action.fontFamily,
		flex: 1,
		color: Ink.body,
	},
});
