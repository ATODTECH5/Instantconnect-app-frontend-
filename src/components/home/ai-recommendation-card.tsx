import { Pressable, StyleSheet, Text, View } from "react-native";

import SparkleIcon from "@/assets/home/sparkle.svg";
import { Brand, BrandGradient, Gap, Ink, Radius, Type } from "@/constants/theme";

const ICON_SIZE = 20;

export type AiRecommendationCardProps = {
	matchCount: number;
	onPress: () => void;
};

export function AiRecommendationCard({ matchCount, onPress }: AiRecommendationCardProps) {
	const body =
		matchCount > 0
			? `We've found ${matchCount} people nearby who match your interests.`
			: "We're still learning your interests. Add a few more to get matches.";

	return (
		<Pressable
			accessibilityHint="Opens your personalised matches"
			accessibilityLabel={`AI Recommendation. ${body}`}
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
		>
			<View style={styles.titleRow}>
				<SparkleIcon color={Brand.onBrand} height={ICON_SIZE} width={ICON_SIZE} />

				<Text style={styles.title}>AI Recommendation</Text>
			</View>

			<Text style={styles.body}>{body}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Gap.tight,
		padding: Gap.card,
		borderRadius: Radius.dialog,
		backgroundColor: Brand.pink,
		...BrandGradient,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.tight,
	},
	title: {
		...Type.promoTitle,
		flexShrink: 1,
		color: Brand.onBrand,
	},
	body: {
		...Type.promoBody,
		color: Ink.onBrandMuted,
	},
	pressed: {
		opacity: 0.85,
	},
});
