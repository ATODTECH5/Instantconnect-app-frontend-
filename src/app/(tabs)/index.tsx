import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AiRecommendationCard } from "@/components/home/ai-recommendation-card";
import { CardCarousel } from "@/components/home/card-carousel";
import { CategoryStrip } from "@/components/home/category-strip";
import { EventCard } from "@/components/home/event-card";
import { HomeHeader } from "@/components/home/home-header";
import { HomeSearchBar } from "@/components/home/home-search-bar";
import { PersonCard } from "@/components/home/person-card";
import { SectionHeader } from "@/components/home/section-header";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import type { NearbyEvent, NearbyPerson } from "@/features/home/home-feed";
import { useConnectRequests } from "@/features/home/use-connect-requests";
import { useHomeFeed } from "@/features/home/use-home-feed";
import { useCurrentUser } from "@/features/user/use-current-user";
import { useDesignScale } from "@/hooks/use-design-scale";
import { useNavBarInset } from "@/hooks/use-nav-bar-inset";

const EDGE_INSET = Spacing.three;
const PERSON_CARD_WIDTH = 171;
const PERSON_CARD_GAP = 11;
const EVENT_CARD_WIDTH = 228;
const EVENT_CARD_GAP = 10;

const BLOCK = {
	afterHeader: 24,
	afterGreeting: 19,
	afterSearch: 16,
	afterCategories: 20,
	afterPromo: 26,
	afterSectionTitle: 12,
	beforeSection: 26,
} as const;

function greetingFor(hour: number) {
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";

	return "Good evening";
}

export default function HomeScreen() {
	const { status, feed, error, refreshing, reload, refresh } = useHomeFeed();
	const { data: user } = useCurrentUser();
	const { stateFor, connect } = useConnectRequests();
	const { horizontal, vertical } = useDesignScale();
	const navInset = useNavBarInset();

	const [query, setQuery] = useState("");

	const personWidth = Math.round(PERSON_CARD_WIDTH * horizontal);
	const eventWidth = Math.round(EVENT_CARD_WIDTH * horizontal);

	// The name arrives on its own request, so the greeting reads correctly on its
	// own until it does rather than showing a placeholder that then changes.
	const greeting = greetingFor(new Date().getHours());
	const greetingLine = user ? `${greeting}, ${user.firstName}` : greeting;

	const openSearch = useCallback(
		(params?: Record<string, string>) => router.push({ pathname: "/search", params }),
		[],
	);

	const handleSearch = useCallback(() => {
		const trimmed = query.trim();
		if (trimmed.length > 0) openSearch({ q: trimmed });
	}, [openSearch, query]);

	const handleCategory = useCallback((id: string) => openSearch({ category: id }), [openSearch]);

	const openPerson = useCallback((id: string) => router.push(`/person/${id}`), []);

	const renderPerson = useCallback(
		(person: NearbyPerson) => (
			<PersonCard
				connectionState={stateFor(person.id)}
				onConnect={connect}
				onOpen={openPerson}
				person={person}
				width={personWidth}
			/>
		),
		[connect, openPerson, personWidth, stateFor],
	);

	const renderEvent = useCallback(
		(event: NearbyEvent) => (
			<EventCard event={event} onOpen={() => openSearch()} width={eventWidth} />
		),
		[eventWidth, openSearch],
	);

	if (status === "loading") {
		return (
			<SafeAreaView edges={["top", "left", "right"]} style={styles.centred}>
				<StatusBar style="dark" />
				<GradientSpinner />

				<Text style={styles.loadingLabel}>Finding people near you</Text>
			</SafeAreaView>
		);
	}

	if (status === "error" || feed === null) {
		return (
			<SafeAreaView edges={["top", "left", "right"]} style={styles.centred}>
				<StatusBar style="dark" />

				<View style={styles.errorBox}>
					<StateMessage
						actionLabel="Try again"
						isError
						message={error ?? "We could not load your feed."}
						onPressAction={reload}
					/>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
			<StatusBar style="dark" />

			<ScrollView
				contentContainerStyle={[styles.content, { paddingBottom: navInset + Spacing.four }]}
				refreshControl={
					<RefreshControl
						onRefresh={refresh}
						refreshing={refreshing}
						tintColor={Brand.purple}
					/>
				}
				showsVerticalScrollIndicator={false}
				style={styles.scroll}
			>
				<View style={styles.column}>
					<View style={styles.padded}>
						<HomeHeader
							avatar={feed.avatar}
							isOnline={feed.isOnline}
							onChangePlace={() => router.push("/location")}
							onOpenNotifications={() => router.push("/notifications")}
							onOpenProfile={() => router.push("/profile")}
							place={feed.place}
							unreadCount={feed.unreadCount}
						/>

						<Text
							accessibilityRole="header"
							style={[styles.greeting, { marginTop: BLOCK.afterHeader * vertical }]}
						>
							{greetingLine} 👋
						</Text>

						<View style={{ marginTop: BLOCK.afterGreeting * vertical }}>
							<HomeSearchBar
								onChangeText={setQuery}
								onOpenFilters={() => openSearch({ filters: "open" })}
								onSubmit={handleSearch}
								value={query}
							/>
						</View>

						<View style={{ marginTop: BLOCK.afterSearch * vertical }}>
							<CategoryStrip onSelect={handleCategory} />
						</View>

						<View style={{ marginTop: BLOCK.afterCategories * vertical }}>
							<AiRecommendationCard
								matchCount={feed.matchCount}
								onPress={() => openSearch({ source: "ai" })}
							/>
						</View>
					</View>

					<View style={[styles.padded, { marginTop: BLOCK.afterPromo * vertical }]}>
						<SectionHeader title="People Near you" />
					</View>

					<View style={{ marginTop: BLOCK.afterSectionTitle * vertical }}>
						<CardCarousel
							accessibilityLabel="People near you"
							data={feed.people}
							edgeInset={EDGE_INSET}
							emptyMessage="No one nearby matches your interests yet. Widen your area to see more people."
							gap={PERSON_CARD_GAP}
							itemWidth={personWidth}
							keyExtractor={(person) => person.id}
							renderCard={renderPerson}
						/>
					</View>

					<View style={[styles.padded, { marginTop: BLOCK.beforeSection * vertical }]}>
						<SectionHeader
							actionLabel="View all"
							onPressAction={() => openSearch({ tab: "events" })}
							title="Happening Around You"
						/>
					</View>

					<View style={{ marginTop: BLOCK.afterSectionTitle * vertical }}>
						<CardCarousel
							accessibilityLabel="Events happening around you"
							data={feed.events}
							edgeInset={EDGE_INSET}
							emptyMessage="Nothing is scheduled around you right now. Check back soon."
							gap={EVENT_CARD_GAP}
							itemWidth={eventWidth}
							keyExtractor={(event) => event.id}
							renderCard={renderEvent}
						/>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	centred: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Gap.card,
		padding: Spacing.three,
		backgroundColor: Ink.surface,
	},
	loadingLabel: {
		...Type.promoBody,
		color: Ink.muted,
	},
	errorBox: {
		width: "100%",
		maxWidth: MaxColumnWidth,
	},
	scroll: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		paddingTop: Gap.tight,
	},
	column: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
	},
	padded: {
		paddingHorizontal: EDGE_INSET,
	},
	greeting: {
		...Type.greeting,
		color: Ink.title,
	},
});
