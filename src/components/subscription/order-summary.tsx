import { StyleSheet, Text, View } from "react-native";

import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import {
	cycleSuffixShort,
	formatNaira,
	priceFor,
	type BillingCycle,
	type Plan,
} from "@/features/subscription/plans";

export type OrderSummaryProps = {
	plan: Plan;
	cycle: BillingCycle;
};

/** "UPGRADING TO / Pro Creator · MONTHLY / Amount Due ₦5,000/mo". */
export function OrderSummary({ plan, cycle }: OrderSummaryProps) {
	const amount = formatNaira(priceFor(plan, cycle));
	const suffix = cycleSuffixShort(cycle);

	return (
		<View
			accessibilityLabel={`Upgrading to ${plan.name}, ${cycle}. Amount due ${amount} ${suffix}`}
			accessibilityRole="summary"
			style={styles.card}
		>
			<View style={styles.header}>
				<View style={styles.headerText}>
					<Text style={styles.overline}>UPGRADING TO</Text>

					<Text numberOfLines={1} style={styles.name}>
						{plan.name}
					</Text>
				</View>

				<View style={styles.cycleTag}>
					<Text style={styles.cycleLabel}>{cycle.toUpperCase()}</Text>
				</View>
			</View>

			<View style={styles.line} />

			<View style={styles.amountRow}>
				<Text style={styles.amountLabel}>Amount Due</Text>

				<Text style={styles.amount}>
					{amount}
					<Text style={styles.amountSuffix}>{suffix}</Text>
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Gap.card,
		padding: Gap.card,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Ink.bubbleIncoming,
		borderRadius: Radius.media,
		backgroundColor: Ink.keypad,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
	},
	headerText: {
		flexShrink: 1,
		gap: Spacing.one,
	},
	overline: {
		...Type.footnote,
		fontFamily: Type.action.fontFamily,
		color: Ink.meta,
	},
	name: {
		...Type.subtitle,
		fontFamily: Type.action.fontFamily,
		color: Ink.title,
	},
	cycleTag: {
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.one,
		borderRadius: Radius.dialog,
		backgroundColor: Brand.purpleTint,
	},
	cycleLabel: {
		...Type.tagLabel,
		color: Brand.purple,
	},
	line: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: Ink.border,
	},
	amountRow: {
		flexDirection: "row",
		alignItems: "baseline",
		justifyContent: "space-between",
		gap: Gap.card,
	},
	amountLabel: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.muted,
	},
	amount: {
		...Type.planPrice,
		color: Brand.purple,
	},
	amountSuffix: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.meta,
	},
});
