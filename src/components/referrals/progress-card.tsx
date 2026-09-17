import { StyleSheet, Text, View } from "react-native";

import { Brand, BrandGradient, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

const TRACK_HEIGHT = 8;

export type ProgressCardProps = {
	joinedCount: number;
	goal: number;
};

/** "Invites progress" (Figma 3051:1526). Full once `goal` friends have joined. */
export function ProgressCard({ joinedCount, goal }: ProgressCardProps) {
	const fraction = Math.min(joinedCount / goal, 1);

	return (
		<View
			accessibilityLabel={`${joinedCount} of ${goal} friends referred`}
			accessibilityRole="progressbar"
			accessibilityValue={{ min: 0, max: goal, now: Math.min(joinedCount, goal) }}
			style={styles.card}
		>
			<View style={styles.row}>
				<Text style={styles.heading}>Invites progress</Text>
				<Text style={styles.count}>{joinedCount} Referred</Text>
			</View>

			<View style={styles.track}>
				<View style={[styles.fill, { width: `${fraction * 100}%` }]} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Gap.card,
		padding: Spacing.three,
		borderWidth: 1,
		borderColor: Brand.purpleTint,
		borderRadius: Radius.dialog,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	heading: {
		...Type.docSection,
		color: Ink.body,
	},
	count: {
		...Type.docSection,
		color: Brand.purple,
	},
	track: {
		height: TRACK_HEIGHT,
		borderRadius: TRACK_HEIGHT / 2,
		overflow: "hidden",
		backgroundColor: Brand.purpleTint,
	},
	fill: {
		...BrandGradient,
		height: "100%",
	},
});
