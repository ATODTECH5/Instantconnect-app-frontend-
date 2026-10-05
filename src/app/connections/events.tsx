import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventSummaryCard } from "@/components/events/event-summary-card";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MaxColumnWidth, Spacing } from "@/constants/theme";
import type { EventTimeframe } from "@/features/events/event-service";
import { useMyEvents, useNearbyEvents } from "@/features/events/use-events";
import { describeError } from "@/lib/api/api-error";
import type { ApiEventSummary } from "@/lib/api/event-schema";

const EDGE_INSET = Spacing.three;

/** The server's page cap. */
const NEARBY_PAGE = 50;

type EventsTab = "nearby" | EventTimeframe;

/** Around You rows carry a distance; the viewer's own events do not. */
type EventRow = ApiEventSummary & { distanceKm?: number };

const TABS: ChipOption[] = [
	{ id: "nearby", label: "Around You" },
	{ id: "upcoming", label: "My Upcoming" },
	{ id: "past", label: "Past" },
	{ id: "all", label: "All" },
];

const EMPTY: Record<EventsTab, string> = {
	nearby: "No public events near you right now. Public events within 50km of your location appear here.",
	upcoming: "Upcoming events you are hosting, invited to or going to will appear here.",
	past: "Events you hosted, were invited to or went to will appear here once they have happened.",
	all: "Events you host, are invited to or are going to will appear here.",
};

function isEventsTab(id: string | undefined): id is EventsTab {
	return id === "nearby" || id === "upcoming" || id === "past" || id === "all";
}

/**
 * Around You is every public event nearby, whoever made it, including
 * imported listings. The other tabs are the viewer's own: hosting,
 * invitations and events they joined.
 */
export default function EventsScreen() {
	const params = useLocalSearchParams<{ tab?: string }>();
	const [tab, setTab] = useState<EventsTab>(isEventsTab(params.tab) ? params.tab : "nearby");
	const isNearby = tab === "nearby";
	const nearby = useNearbyEvents({ limit: NEARBY_PAGE }, isNearby);
	const mine = useMyEvents(isNearby ? "upcoming" : tab, "any", !isNearby);
	const events = isNearby ? nearby : mine;

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/connection");
	}, []);

	const openEvent = useCallback((id: string) => router.push(`/events/${id}`), []);

	const renderEvent = useCallback(
		({ item }: { item: EventRow }) => (
			<EventSummaryCard actionLabel="View Event" event={item} onOpen={openEvent} />
		),
		[openEvent],
	);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Events" />

				<ChipGroup
					accessibilityLabel="Filter events"
					onSelect={(id) => {
						if (isEventsTab(id)) setTab(id);
					}}
					options={TABS}
					scrollable
					selectedId={tab}
				/>

				{events.isPending ? (
					<StateMessage message="Loading events…" />
				) : events.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(events.error)}
						onPressAction={() => void events.refetch()}
					/>
				) : (
					<FlatList
						ListEmptyComponent={<StateMessage message={EMPTY[tab]} />}
						contentContainerStyle={styles.list}
						data={events.data.items satisfies EventRow[]}
						keyExtractor={(item) => item.id}
						refreshControl={
							<RefreshControl
								onRefresh={() => void events.refetch()}
								refreshing={events.isRefetching}
								tintColor={Brand.purple}
							/>
						}
						renderItem={renderEvent}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	column: {
		flex: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	list: {
		gap: Gap.card,
		paddingBottom: Spacing.four,
	},
});
