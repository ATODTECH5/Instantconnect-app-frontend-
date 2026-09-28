import { router } from "expo-router";
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
import { useMyEvents } from "@/features/events/use-events";
import { describeError } from "@/lib/api/api-error";
import type { ApiEventSummary } from "@/lib/api/event-schema";

const EDGE_INSET = Spacing.three;

const TABS: ChipOption[] = [
	{ id: "upcoming", label: "Upcoming Events" },
	{ id: "past", label: "Past" },
	{ id: "all", label: "All" },
];

const EMPTY: Record<EventTimeframe, string> = {
	upcoming: "Upcoming events you are hosting or invited to will appear here.",
	past: "Events you hosted or were invited to will appear here once they have happened.",
	all: "Events you host or are invited to will appear here.",
};

function isTimeframe(id: string): id is EventTimeframe {
	return id === "upcoming" || id === "past" || id === "all";
}

/**
 * Hosting plus invitations. There is no joining yet, so "registered" means the
 * events the viewer is already part of rather than ones they signed up for.
 */
export default function RegisteredEventsScreen() {
	const [tab, setTab] = useState<EventTimeframe>("upcoming");
	const events = useMyEvents(tab, "any");

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/connection");
	}, []);

	const openEvent = useCallback((id: string) => router.push(`/events/${id}`), []);

	const renderEvent = useCallback(
		({ item }: { item: ApiEventSummary }) => (
			<EventSummaryCard actionLabel="View Event" event={item} onOpen={openEvent} />
		),
		[openEvent],
	);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Registered Events" />

				<ChipGroup
					accessibilityLabel="Filter events"
					onSelect={(id) => {
						if (isTimeframe(id)) setTab(id);
					}}
					options={TABS}
					scrollable
					selectedId={tab}
				/>

				{events.isPending ? (
					<StateMessage message="Loading your events…" />
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
						data={events.data.items}
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
