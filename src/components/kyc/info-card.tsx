import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import InfoIcon from "@/assets/settings/info.svg";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 18;

export type InfoCardProps = {
	title: string;
	body: string;
	Icon?: FC<SvgProps>;
};

/** The grey "Why is this needed?" plate on the KYC hub. */
export function InfoCard({ title, body, Icon = InfoIcon }: InfoCardProps) {
	return (
		<View style={styles.card}>
			<Icon color={Brand.purple} height={ICON_SIZE} width={ICON_SIZE} />

			<View style={styles.text}>
				<Text style={styles.title}>{title}</Text>
				<Text style={styles.body}>{body}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		gap: Gap.card,
		padding: Spacing.three,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.bubbleIncoming,
	},
	text: {
		flex: 1,
		gap: Spacing.one,
	},
	title: {
		...Type.docSection,
		color: Ink.title,
	},
	body: {
		...Type.footnote,
		color: Ink.muted,
	},
});
