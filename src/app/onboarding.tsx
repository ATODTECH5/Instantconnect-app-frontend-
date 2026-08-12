import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	CARD_STACK_FRAME,
	CardStackIllustration,
} from "@/components/onboarding/card-stack-illustration";
import {
	DISCOVERY_FRAME,
	DiscoveryIllustration,
} from "@/components/onboarding/discovery-illustration";
import { GetStartedPanel } from "@/components/onboarding/get-started-panel";
import { OnboardingSlide } from "@/components/onboarding/onboarding-slide";
import { ORBIT_FRAME, OrbitIllustration } from "@/components/onboarding/orbit-illustration";
import { PagerDots } from "@/components/onboarding/pager-dots";
import { Ink, Type } from "@/constants/theme";

const SLIDES = [
	{
		key: "nearby",
		title: "Meet Real People\nAround You",
		body: "Discover nearby people for networking, friendship, social activities, talents, and meaningful real-world connections.",
		illustration: <OrbitIllustration />,
		illustrationTop: 222,
		illustrationHeight: ORBIT_FRAME.height,
	},
	{
		key: "meetups",
		title: "Plan Safer Meetups\nwith Confidence",
		body: "Chat securely, exchange details, choose meetup spots together, and verify arrivals with our GPS-powered safety system.",
		illustration: <CardStackIllustration />,
		illustrationTop: 216,
		illustrationHeight: CARD_STACK_FRAME.height,
	},
	{
		key: "places",
		title: "Connect Beyond the\nSwipe",
		body: "From cafés and coworking spaces to local events, discover the perfect place to meet people who share your interests.",
		illustration: <DiscoveryIllustration />,
		illustrationTop: 165,
		illustrationHeight: DISCOVERY_FRAME.height,
	},
];

/** Overlay height for the Skip control. */
const HEADER_HEIGHT = 44;

export default function OnboardingScreen() {
	const { width, height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const [index, setIndex] = useState(0);

	const isGetStarted = index === SLIDES.length;

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const next = Math.round(event.nativeEvent.contentOffset.x / width);
			setIndex((current) => (current === next ? current : next));
		},
		[width],
	);

	const handleSkip = useCallback(() => router.replace("/get-started"), []);
	const handleStart = useCallback(() => router.replace("/(tabs)"), []);

	return (
		<View style={styles.screen}>
			<StatusBar style={isGetStarted ? "light" : "dark"} />

			<ScrollView
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			>
				{SLIDES.map((slide) => (
					<View key={slide.key} style={{ width }}>
						<OnboardingSlide
							title={slide.title}
							body={slide.body}
							illustration={slide.illustration}
							illustrationTop={slide.illustrationTop}
							illustrationHeight={slide.illustrationHeight}
							safeTop={insets.top}
						/>
					</View>
				))}

				<View style={{ width, height }}>
					<GetStartedPanel onStart={handleStart} />
				</View>
			</ScrollView>

			{!isGetStarted && (
				<>
					<View style={[styles.header, { top: insets.top }]}>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Skip onboarding"
							hitSlop={12}
							onPress={handleSkip}
							style={styles.skip}
						>
							<Text style={styles.skipLabel}>Skip</Text>
						</Pressable>
					</View>

					<View style={[styles.footer, { bottom: insets.bottom + 24 }]}>
						<PagerDots count={SLIDES.length} activeIndex={index} />
					</View>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	header: {
		position: "absolute",
		left: 0,
		right: 0,
		height: HEADER_HEIGHT,
		pointerEvents: "box-none",
		justifyContent: "center",
		alignItems: "flex-end",
		paddingHorizontal: 16,
	},
	skip: {
		paddingVertical: 4,
		paddingHorizontal: 4,
	},
	skipLabel: {
		...Type.action,
		color: Ink.muted,
	},
	footer: {
		position: "absolute",
		left: 0,
		right: 0,
		pointerEvents: "none",
	},
});
