import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Ink, Spacing, Type } from "@/constants/theme";

const SLIDES = [
	{
		key: "nearby",
		title: "Meet Real People\nAround You",
		body: "Discover nearby people for networking, friendship, social activities, talents, and meaningful real-world connections.",
		illustration: <OrbitIllustration />,
		illustrationFrame: ORBIT_FRAME,
	},
	{
		key: "meetups",
		title: "Plan Safer Meetups\nwith Confidence",
		body: "Chat securely, exchange details, choose meetup spots together, and verify arrivals with our GPS-powered safety system.",
		illustration: <CardStackIllustration />,
		illustrationFrame: CARD_STACK_FRAME,
	},
	{
		key: "places",
		title: "Connect Beyond the\nSwipe",
		body: "From cafés and coworking spaces to local events, discover the perfect place to meet people who share your interests.",
		illustration: <DiscoveryIllustration />,
		illustrationFrame: DISCOVERY_FRAME,
	},
];

/** Overlay height for the Skip control. */
const HEADER_HEIGHT = 44;

/** Dot diameter plus the track's vertical padding. */
const DOTS_HEIGHT = 10;

export default function OnboardingScreen() {
	const { width, height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const [index, setIndex] = useState(0);
	const pagerRef = useRef<ScrollView>(null);
	const indexRef = useRef(0);

	const isGetStarted = index === SLIDES.length;
	const footerBottom = insets.bottom + Spacing.four;
	const slideBottomInset = footerBottom + DOTS_HEIGHT + Spacing.three;

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const next = Math.round(event.nativeEvent.contentOffset.x / width);
			indexRef.current = next;
			setIndex((current) => (current === next ? current : next));
		},
		[width],
	);

	// A rotation or split view resize leaves the pager parked between two pages.
	useEffect(() => {
		pagerRef.current?.scrollTo({ x: indexRef.current * width, animated: false });
	}, [width]);

	const handleSkip = useCallback(() => router.replace("/get-started"), []);
	const handleStart = useCallback(() => router.replace("/(tabs)"), []);

	return (
		<View style={styles.screen}>
			<StatusBar style={isGetStarted ? "light" : "dark"} />

			<ScrollView
				ref={pagerRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			>
				{SLIDES.map((slide) => (
					<View key={slide.key} style={{ width, height }}>
						<OnboardingSlide
							title={slide.title}
							body={slide.body}
							illustration={slide.illustration}
							illustrationFrame={slide.illustrationFrame}
							topInset={insets.top}
							bottomInset={slideBottomInset}
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

					<View style={[styles.footer, { bottom: footerBottom }]}>
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
