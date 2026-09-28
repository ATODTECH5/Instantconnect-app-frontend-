import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlusIcon from "@/assets/connections/plus-filled.svg";
import { ConnectionRow } from "@/components/connections/connection-row";
import { StoryRail } from "@/components/connections/story-rail";
import { VisitedPlaceCard } from "@/components/connections/visited-place-card";
import { EventSummaryCard } from "@/components/events/event-summary-card";
import { SectionHeader } from "@/components/home/section-header";
import { IconButton } from "@/components/ui/icon-button";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { connectionMeta } from "@/features/connections/connection-meta";
import { useConnections } from "@/features/connections/use-connections";
import { VISITED_PLACES } from "@/features/connections/visited-places";
import { useMyEvents } from "@/features/events/use-events";
import { useNavBarInset } from "@/hooks/use-nav-bar-inset";
import { describeError, isApiError } from "@/lib/api/api-error";

const EDGE_INSET = Spacing.three;
/** How many rows the tab shows before See All takes over. */
const PREVIEW_COUNT = 6;

const TABS: ChipOption[] = [
	{ id: "people", label: "People" },
	{ id: "places", label: "Visited Places" },
	{ id: "events", label: "Events" },
	{ id: "community", label: "Community" },
];

/** How many cards each tab previews before its See All takes over. */
const TAB_PREVIEW_COUNT = 2;

export default function ConnectionScreen() {
	const navInset = useNavBarInset();
	const [tab, setTab] = useState("people");

	const accepted = useConnections("accepted");
	const upcomingEvents = useMyEvents("upcoming", "any");

	const openPerson = useCallback((id: string) => router.push(`/person/${id}`), []);
	const openEvent = useCallback((id: string) => router.push(`/events/${id}`), []);

	const connections = useMemo(() => accepted.data?.items ?? [], [accepted.data]);

	const railPeople = useMemo(
		() =>
			connections.map((connection) => ({
				id: connection.party.id,
				fullName: connection.party.fullName,
				avatarUrl: connection.party.avatarUrl,
			})),
		[connections],
	);

	function renderPeople() {
		if (accepted.isPending) {
			return (
				<View style={styles.centre}>
					<GradientSpinner />

					<Text style={styles.loadingLabel}>Loading your connections</Text>
				</View>
			);
		}

		if (accepted.isError) {
			return (
				<View style={styles.padded}>
					<StateMessage
						actionLabel="Try again"
						isError
						message={
							isApiError(accepted.error)
								? accepted.error.message
								: "We could not load your connections."
						}
						onPressAction={() => void accepted.refetch()}
					/>
				</View>
			);
		}

		if (connections.length === 0) {
			return (
				<View style={styles.padded}>
					<StateMessage message="No connections yet. Connect with people near you from Discover." />
				</View>
			);
		}

		return (
			<View style={styles.padded}>
				<SectionHeader
					actionHint="Opens every connection"
					actionLabel="See All"
					onPressAction={() => router.push("/connections/safety")}
					title="Safety Connections"
				/>

				<View style={styles.list}>
					{connections.slice(0, PREVIEW_COUNT).map((connection) => (
						<ConnectionRow
							avatarUrl={connection.party.avatarUrl}
							fullName={connection.party.fullName}
							id={connection.party.id}
							key={connection.id}
							meta={connectionMeta(connection)}
							onOpen={openPerson}
						/>
					))}
				</View>
			</View>
		);
	}

	function renderEvents() {
		if (upcomingEvents.isPending) {
			return <StateMessage message="Loading your events…" />;
		}

		if (upcomingEvents.isError) {
			return (
				<StateMessage
					actionLabel="Try again"
					isError
					message={describeError(upcomingEvents.error)}
					onPressAction={() => void upcomingEvents.refetch()}
				/>
			);
		}

		const events = upcomingEvents.data.items.slice(0, TAB_PREVIEW_COUNT);

		if (events.length === 0) {
			return (
				<StateMessage message="Upcoming events you are hosting or invited to will appear here." />
			);
		}

		return (
			<View style={styles.cards}>
				{events.map((event) => (
					<EventSummaryCard
						actionLabel="View Event"
						event={event}
						key={event.id}
						onOpen={openEvent}
					/>
				))}
			</View>
		);
	}

	return (
		<SafeAreaView edges={["top"]} style={styles.screen}>
			<StatusBar style="dark" />

			<ScrollView
				contentContainerStyle={[styles.content, { paddingBottom: navInset + Spacing.four }]}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.padded}>
					<View style={styles.header}>
						<Text accessibilityRole="header" style={styles.title}>
							Connection
						</Text>

						<IconButton
							Icon={PlusIcon}
							accessibilityHint="Opens Discover to find people near you"
							accessibilityLabel="Add a connection"
							onPress={() => router.push("/discover")}
							tone="brand"
						/>
					</View>
				</View>

				{railPeople.length > 0 ? (
					<StoryRail edgeInset={EDGE_INSET} onOpen={openPerson} people={railPeople} />
				) : null}

				<ChipGroup
					accessibilityLabel="Connection sections"
					edgeInset={EDGE_INSET}
					onSelect={setTab}
					options={TABS}
					scrollable
					selectedId={tab}
				/>

				{tab === "people" ? renderPeople() : null}

				{tab === "places" ? (
					<View style={styles.padded}>
						<SectionHeader
							actionHint="Opens every visited place"
							actionLabel="See All"
							onPressAction={() => router.push("/connections/places")}
							title="Visited Places"
						/>

						<View style={styles.cards}>
							{VISITED_PLACES.slice(0, TAB_PREVIEW_COUNT).map((place) => (
								<VisitedPlaceCard
									key={place.id}
									onOpen={() => router.push("/connections/places")}
									place={place}
								/>
							))}
						</View>
					</View>
				) : null}

				{tab === "events" ? (
					<View style={styles.padded}>
						<SectionHeader
							actionHint="Opens every event you are hosting or invited to"
							actionLabel="See All"
							onPressAction={() => router.push("/connections/events")}
							title="Upcoming Events"
						/>

						{renderEvents()}
					</View>
				) : null}

				{tab === "community" ? (
					<View style={styles.padded}>
						<StateMessage message="Communities will appear here once the community module is built." />
					</View>
				) : null}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	content: {
		/**
		 * Deliberately not flexGrow: 1. The rail and the chip strip are both
		 * horizontal ScrollViews, and a growable container hands them the
		 * leftover height, which opens a dead gap under each.
		 */
		gap: Gap.section,
		paddingTop: Spacing.two,
	},
	padded: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
		gap: Gap.card,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.three,
	},
	title: {
		...Type.screenTitle,
		flexShrink: 1,
		color: Ink.title,
	},
	list: {
		gap: Spacing.two,
	},
	cards: {
		gap: Gap.card,
	},
	centre: {
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Gap.card,
		paddingVertical: Spacing.six,
	},
	loadingLabel: {
		...Type.cardMeta,
		color: Ink.meta,
	},
});
