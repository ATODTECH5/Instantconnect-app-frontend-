import { StyleSheet, Text, View } from "react-native";

import { Brand, CategoryTone, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { Plan } from "@/features/subscription/plans";

export type CurrentPlanPlateProps = {
	plan: Plan;
};

/** "CURRENT PLAN / Free Basic Tier" with a tag at the trailing edge. */
export function CurrentPlanPlate({ plan }: CurrentPlanPlateProps) {
	const isFree = plan.id === "free";

	return (
		<View
			accessibilityLabel={`Current plan, ${plan.name}`}
			accessibilityRole="summary"
			style={styles.plate}
		>
			<View style={styles.label}>
				<Text style={styles.overline}>CURRENT PLAN</Text>

				<Text numberOfLines={1} style={styles.name}>
					{plan.name}
				</Text>
			</View>

			<View style={[styles.tag, isFree ? styles.tagFree : styles.tagActive]}>
				<Text
					style={[styles.tagLabel, isFree ? styles.tagLabelFree : styles.tagLabelActive]}
				>
					{isFree ? "Free" : "Active"}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	plate: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.three,
		padding: Spacing.three,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.keypad,
	},
	label: {
		flexShrink: 1,
		gap: Spacing.one,
	},
	overline: {
		...Type.overline,
		color: Ink.muted,
	},
	name: {
		...Type.subtitle,
		color: Ink.title,
	},
	tag: {
		paddingHorizontal: Gap.card,
		paddingVertical: Spacing.two - Spacing.half,
		borderRadius: Radius.pill,
	},
	tagFree: {
		backgroundColor: CategoryTone.peach.surface,
	},
	tagActive: {
		backgroundColor: Brand.purpleSurface,
	},
	tagLabel: {
		...Type.badgeLabel,
		fontFamily: Type.cta.fontFamily,
	},
	tagLabelFree: {
		color: Ink.meta,
	},
	tagLabelActive: {
		color: Brand.purple,
	},
});
