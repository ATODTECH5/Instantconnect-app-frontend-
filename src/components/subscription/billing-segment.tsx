import { Pressable, StyleSheet, Text, View } from "react-native";

import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import type { BillingCycle } from "@/features/subscription/plans";

const TRACK_FILL = "rgba(233, 213, 255, 0.3)";
const TAB_SHADOW = "0px 2px 2px rgba(147, 51, 234, 0.07)";

export type BillingSegmentProps = {
	value: BillingCycle;
	onChange: (cycle: BillingCycle) => void;
	/** The orange "Save 20%" pill on the annual tab. */
	savingsLabel: string;
};

/** Monthly / Annual toggle from the Plan Details frame. */
export function BillingSegment({ value, onChange, savingsLabel }: BillingSegmentProps) {
	return (
		<View accessibilityRole="tablist" style={styles.track}>
			<Tab
				label="Monthly"
				onPress={() => onChange("monthly")}
				selected={value === "monthly"}
			/>

			<Tab
				label="Annual"
				onPress={() => onChange("annual")}
				selected={value === "annual"}
				trailing={
					<View style={styles.savings}>
						<Text style={styles.savingsLabel}>{savingsLabel}</Text>
					</View>
				}
			/>
		</View>
	);
}

type TabProps = {
	label: string;
	selected: boolean;
	onPress: () => void;
	trailing?: React.ReactNode;
};

function Tab({ label, selected, onPress, trailing }: TabProps) {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="tab"
			accessibilityState={{ selected }}
			onPress={onPress}
			style={({ pressed }) => [
				styles.tab,
				selected && styles.tabSelected,
				pressed && !selected && styles.pressed,
			]}
		>
			<Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{label}</Text>

			{trailing}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	track: {
		flexDirection: "row",
		gap: Spacing.one,
		padding: Spacing.one,
		borderRadius: Radius.dialog,
		backgroundColor: TRACK_FILL,
	},
	tab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.two,
		minHeight: MinTapTarget - Spacing.two,
		paddingVertical: Spacing.two,
		borderRadius: Radius.control,
	},
	tabSelected: {
		backgroundColor: Ink.surface,
		boxShadow: TAB_SHADOW,
	},
	tabLabel: {
		...Type.consent,
		fontFamily: Type.action.fontFamily,
		color: Ink.muted,
	},
	tabLabelSelected: {
		color: Brand.purple,
	},
	savings: {
		paddingHorizontal: Spacing.two,
		paddingVertical: Spacing.half,
		borderRadius: Radius.pill,
		backgroundColor: Brand.orange,
	},
	savingsLabel: {
		...Type.tagLabel,
		fontFamily: Type.planPrice.fontFamily,
		color: Brand.onBrand,
	},
	pressed: {
		opacity: 0.7,
	},
});
