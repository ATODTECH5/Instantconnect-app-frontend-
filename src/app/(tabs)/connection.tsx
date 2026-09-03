import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlusIcon from "@/assets/connections/plus-filled.svg";
import { ConnectionRow } from "@/components/connections/connection-row";
import { StoryRail } from "@/components/connections/story-rail";
import { SectionHeader } from "@/components/home/section-header";
import { IconButton } from "@/components/ui/icon-button";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { connectionMeta } from "@/features/connections/connection-meta";
import { useConnections } from "@/features/connections/use-connections";
import { useNavBarInset } from "@/hooks/use-nav-bar-inset";
import { isApiError } from "@/lib/api/api-error";

const EDGE_INSET = Spacing.three;
/** How many rows the tab shows before See All takes over. */
const PREVIEW_COUNT = 6;

const TABS: ChipOption[] = [
	{ id: "people", label: "People" },
	{ id: "places", label: "Visited Places" },
	{ id: "events", label: "Events" },
	{ id: "community", label: "Community" },
];

const PENDING_BACKEND: Record<string, string> = {
	places: "Places you have visited will appear here once meetups are recorded.",
	events: "Events you register for will appear here once events are built.",
	community: "Communities will appear here once the community module is built.",
};

export default function ConnectionScreen() {
	const navInset = useNavBarInset();
	const [tab, setTab] = useState("people");

	const accepted = useConnections("accepted");

	const openPerson = useCallback((id: string) => router.push(`/person/${id}`), []);

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

				{tab === "people" ? (
					renderPeople()
				) : (
					<View style={styles.padded}>
						<StateMessage message={PENDING_BACKEND[tab] ?? ""} />
					</View>
				)}
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
