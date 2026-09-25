import { StyleSheet, Text, View } from "react-native";

import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

export type TagTone = "brand" | "success" | "warning";

export type TagProps = {
	label: string;
	tone: TagTone;
};

/** A small status pill: "GPS Active", "UPCOMING", "FREE". */
export function Tag({ label, tone }: TagProps) {
	return (
		<View style={[styles.tag, TONE[tone].box]}>
			<Text style={[styles.label, TONE[tone].label]}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	tag: {
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.one,
		borderRadius: Radius.pill,
	},
	label: {
		...Type.badgeLabel,
	},
	brandBox: {
		backgroundColor: Brand.purpleSurface,
	},
	brandLabel: {
		color: Brand.purple,
	},
	successBox: {
		backgroundColor: Ink.successSurface,
		borderWidth: 1,
		borderColor: Ink.successBorder,
	},
	successLabel: {
		color: Ink.success,
	},
	warningBox: {
		backgroundColor: Ink.warningSurface,
		borderWidth: 1,
		borderColor: Ink.warningBorder,
	},
	warningLabel: {
		color: Brand.orange,
	},
});

const TONE = {
	brand: { box: styles.brandBox, label: styles.brandLabel },
	success: { box: styles.successBox, label: styles.successLabel },
	warning: { box: styles.warningBox, label: styles.warningLabel },
} as const;
