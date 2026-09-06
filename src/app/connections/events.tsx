import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RegisteredEventCard } from "@/components/connections/registered-event-card";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Spacing } from "@/constants/theme";
import {
	eventsForTab,
	REGISTERED_EVENTS,
	type RegisteredEvent,
	type RegisteredEventTab,
} from "@/features/connections/registered-events";

const EDGE_INSET = Spacing.three;

const TABS: ChipOption[] = [
	{ id: "upcoming", label: "Upcoming Events" },
	{ id: "past", label: "Past" },
	{ id: "all", label: "All" },
];

const EMPTY: Record<RegisteredEventTab, string> = {
	upcoming: "You have not registered for any upcoming events.",
	past: "Events you have attended will appear here.",
	all: "Events you register for will appear here.",
};

export default function RegisteredEventsScreen() {
	const [tab, setTab] = useState<RegisteredEventTab>("upcoming");

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/connection");
	}, []);

	const openEvent = useCallback((id: string) => router.push(`/events/${id}`), []);

	const events = useMemo(() => eventsForTab(REGISTERED_EVENTS, tab), [tab]);

	const renderEvent = useCallback(
		({ item }: { item: RegisteredEvent }) => (
			<RegisteredEventCard event={item} onOpen={openEvent} />
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
					onSelect={(id) => setTab(id as RegisteredEventTab)}
					options={TABS}
					scrollable
					selectedId={tab}
				/>

				{events.length === 0 ? (
					<StateMessage message={EMPTY[tab]} />
				) : (
					<FlatList
						contentContainerStyle={styles.list}
						data={events}
						keyExtractor={(item) => item.id}
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
