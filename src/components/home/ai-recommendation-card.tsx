import SparkleIcon from "@/assets/home/sparkle.svg";
import { PromoCard } from "@/components/ui/promo-card";

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
		<PromoCard
			Icon={SparkleIcon}
			accessibilityHint="Opens your personalised matches"
			body={body}
			onPress={onPress}
			title="AI Recommendation"
		/>
	);
}
