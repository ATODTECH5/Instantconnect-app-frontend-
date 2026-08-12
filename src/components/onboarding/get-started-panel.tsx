import type { FC } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import HeroPin from "@/assets/onboarding/gs-hero-pin.svg";
import IconCategories from "@/assets/onboarding/gs-icon-categories.svg";
import IconDiscover from "@/assets/onboarding/gs-icon-discover.svg";
import IconMatches from "@/assets/onboarding/gs-icon-matches.svg";
import IconVerified from "@/assets/onboarding/gs-icon-verified.svg";
import { GradientBackground } from "@/components/gradient-background";
import { Brand, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { useDesignScale } from "@/hooks/use-design-scale";

const HERO_SIZE = 74;
const BADGE_SIZE = 44;

/** Vertical rhythm from the artboard, tightened on shorter screens. */
const GAP = {
	headline: 37,
	features: 53,
	betweenFeatures: 38,
} as const;

type Feature = {
	key: string;
	Icon: FC<SvgProps>;
	title: string;
	body: string;
};

const FEATURES: Feature[] = [
	{
		key: "discover",
		Icon: IconDiscover,
		title: "Discover People Nearby",
		body: "Find friends, business partners & talents in Lagos based on your interests",
	},
	{
		key: "verified",
		Icon: IconVerified,
		title: "Verified Meetups",
		body: "Safe check-ins with arrival codes so you meet real people",
	},
	{
		key: "matches",
		Icon: IconMatches,
		title: "Smart Matches",
		body: "Get suggestions for people and places that fit your goals",
	},
	{
		key: "categories",
		Icon: IconCategories,
		title: "Real Categories",
		body: "Get smart suggestions for the perfect meeting spots.",
	},
];

export function GetStartedPanel({ onStart }: { onStart: () => void }) {
	const insets = useSafeAreaInsets();
	const { vertical } = useDesignScale();

	return (
		<GradientBackground style={styles.panel}>
			<ScrollView
				contentContainerStyle={[
					styles.content,
					{
						paddingTop: insets.top + Spacing.five * vertical,
						paddingBottom: insets.bottom + Spacing.five * vertical,
					},
				]}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.column}>
					<View style={styles.hero}>
						<HeroPin width={HERO_SIZE} height={HERO_SIZE} />
					</View>

					<Text style={[styles.headline, { marginTop: GAP.headline * vertical }]}>
						Meet People Near You. Right Now
					</Text>

					<View
						style={{
							marginTop: GAP.features * vertical,
							gap: GAP.betweenFeatures * vertical,
						}}
					>
						{FEATURES.map(({ key, Icon, title, body }) => (
							<View key={key} style={styles.feature}>
								<View style={styles.badge}>
									<Icon width={BADGE_SIZE} height={BADGE_SIZE} />
								</View>

								<View style={styles.featureText}>
									<Text style={styles.featureTitle}>{title}</Text>
									<Text style={styles.featureBody}>{body}</Text>
								</View>
							</View>
						))}
					</View>

					<View style={styles.spacer} />

					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Get started"
						onPress={onStart}
						style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
					>
						<Text style={styles.ctaLabel}>Get Started</Text>
					</Pressable>
				</View>
			</ScrollView>
		</GradientBackground>
	);
}

const styles = StyleSheet.create({
	panel: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		alignItems: "center",
		paddingHorizontal: 16,
	},
	column: {
		flexGrow: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
	},
	hero: {
		width: HERO_SIZE,
		height: HERO_SIZE,
		borderRadius: HERO_SIZE / 2,
		backgroundColor: Ink.surface,
		alignSelf: "center",
	},
	headline: {
		...Type.heroTitle,
		color: Ink.surface,
		textAlign: "center",
	},
	feature: {
		flexDirection: "row",
		gap: 15,
	},
	badge: {
		width: BADGE_SIZE,
		height: BADGE_SIZE,
		borderRadius: BADGE_SIZE / 2,
		backgroundColor: "rgba(255, 255, 255, 0.14)",
		borderWidth: 0.5,
		borderColor: "rgba(255, 255, 255, 0.2)",
	},
	featureText: {
		flex: 1,
	},
	featureTitle: {
		...Type.featureTitle,
		color: Ink.surface,
	},
	featureBody: {
		...Type.featureBody,
		color: Ink.onBrandMuted,
		marginTop: 2,
	},
	spacer: {
		flex: 1,
		minHeight: 40,
	},
	cta: {
		minHeight: 48,
		paddingVertical: Spacing.two,
		paddingHorizontal: Spacing.four,
		borderRadius: 8,
		backgroundColor: Ink.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	ctaPressed: {
		opacity: 0.85,
	},
	ctaLabel: {
		...Type.cta,
		color: Brand.purple,
	},
});
