import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlusIcon from "@/assets/profile/plus.svg";
import { EventListCard } from "@/components/events/event-list-card";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ChipGroup } from "@/components/ui/chip-group";
import { EmptyState } from "@/components/ui/empty-state";
import { StateMessage } from "@/components/ui/state-message";
import {
	Brand,
	Gap,
	Ink,
	MaxColumnWidth,
	MinTapTarget,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import type { EventTimeframe } from "@/features/events/event-service";
import { useMyEvents } from "@/features/events/use-events";
import { describeError } from "@/lib/api/api-error";
import type { ApiEventSummary } from "@/lib/api/event-schema";
import { formatSchedule } from "@/utils/format";

const EmptyEventsArt = require("@/assets/events/empty-events.png");

const EDGE_INSET = Spacing.three;
const PLUS = 18;
const PILL_HEIGHT = 34;

const TABS: { id: EventTimeframe; label: string }[] = [
	{ id: "upcoming", label: "Upcoming Events" },
	{ id: "past", label: "Past" },
];

const EMPTY_COPY: Record<EventTimeframe, string> = {
	upcoming: "You have not created any events yet. Events you create will show here.",
	past: "Events you hosted will show here once they have happened.",
};

/** The Profile's "Create Event" row lands here: the host's own events, then the form. */
export default function MyEventsScreen() {
	const [tab, setTab] = useState<EventTimeframe>("upcoming");
	const events = useMyEvents(tab);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/(tabs)/profile");
	}, []);

	const openEvent = useCallback((id: string) => router.push(`/events/hosted/${id}`), []);

	const renderItem = useCallback(
		({ item }: { item: ApiEventSummary }) => {
			const faces = item.inviteePreview.flatMap((person) =>
				person.avatarUrl ? [{ uri: person.avatarUrl }] : [],
			);

			return (
				<EventListCard
					actionLabel="View Details"
					countLabel={`${item.inviteeCount} invited`}
					extraFaces={item.inviteeCount - faces.length}
					faces={faces}
					id={item.id}
					onOpen={openEvent}
					photo={item.coverUrl ? { uri: item.coverUrl } : null}
					scheduleLabel={formatSchedule(item.startsAt)}
					title={item.title}
					venue={item.venue.name}
				/>
			);
		},
		[openEvent],
	);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader
					onBack={goBack}
					title="Create Event"
					trailing={
						<Pressable
							accessibilityHint="Opens the new event form"
							accessibilityLabel="Create Event"
							accessibilityRole="button"
							hitSlop={(MinTapTarget - PILL_HEIGHT) / 2}
							onPress={() => router.push("/profile/new-event")}
							style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
						>
							<PlusIcon color={Brand.purple} height={PLUS} width={PLUS} />

							<Text style={styles.pillLabel}>Create Event</Text>
						</Pressable>
					}
				/>

				<ChipGroup
					accessibilityLabel="Event timeframe"
					onSelect={(id) => setTab(id === "past" ? "past" : "upcoming")}
					options={TABS}
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
						ListEmptyComponent={
							<EmptyState
								body={EMPTY_COPY[tab]}
								illustration={EmptyEventsArt}
								title="Nothing to show here"
							/>
						}
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
						renderItem={renderItem}
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
		gap: Gap.section,
	},
	pill: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
		minHeight: PILL_HEIGHT,
		paddingHorizontal: Spacing.two,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurface,
	},
	pillLabel: {
		...Type.cardAction,
		color: Brand.purple,
	},
	list: {
		flexGrow: 1,
		gap: Gap.section,
		paddingBottom: Spacing.five,
	},
	pressed: {
		opacity: 0.7,
	},
});
