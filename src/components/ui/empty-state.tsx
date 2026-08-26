import type { FC } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";

const ART_FRACTION = 0.55;
const ART_MAX = 260;
const ART_ASPECT = 220 / 200;

export type EmptyStateProps = {
	Illustration: FC<SvgProps>;
	title: string;
	body: string;
};

/**
 * Illustrated counterpart to `state-message`, which stays the text only option
 * for empty sections inside an otherwise populated screen.
 */
export function EmptyState({ Illustration, title, body }: EmptyStateProps) {
	const { width } = useWindowDimensions();
	const artWidth = Math.min(width * ART_FRACTION, ART_MAX);

	return (
		<View accessibilityLiveRegion="polite" style={styles.box}>
			<Illustration height={artWidth / ART_ASPECT} width={artWidth} />

			<View style={styles.copy}>
				<Text accessibilityRole="header" style={styles.title}>
					{title}
				</Text>

				<Text style={styles.body}>{body}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		flexGrow: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.five,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.five,
	},
	copy: {
		alignItems: "center",
		gap: Gap.snug,
	},
	title: {
		...Type.emptyTitle,
		color: Ink.title,
		textAlign: "center",
	},
	body: {
		...Type.emptyBody,
		color: Ink.meta,
		textAlign: "center",
	},
});
