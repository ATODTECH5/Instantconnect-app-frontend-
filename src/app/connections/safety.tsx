import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConnectionRow } from "@/components/connections/connection-row";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { SearchField } from "@/components/ui/search-field";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { connectionMeta } from "@/features/connections/connection-meta";
import { useConnections } from "@/features/connections/use-connections";
import type { ApiConnection } from "@/lib/api/discovery-schema";
import { isApiError } from "@/lib/api/api-error";

const EDGE_INSET = Spacing.three;

const FILTERS: ChipOption[] = [
	{ id: "recent", label: "Recent" },
	{ id: "safe", label: "Safe Connections" },
	{ id: "unsafe", label: "Unsafe Connections" },
];

/**
 * Safe and unsafe are a safety rating the meetup flow has not been built to
 * produce yet, so those filters say so rather than silently showing everyone.
 */
const NEEDS_SAFETY_DATA =
	"Safety ratings come from completed meetups, which are not built yet.";

export default function SafetyConnectionsScreen() {
	const [filter, setFilter] = useState("recent");
	const [query, setQuery] = useState("");

	const accepted = useConnections("accepted");

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/connection");
	}, []);

	const openPerson = useCallback((id: string) => router.push(`/person/${id}`), []);

	const results = useMemo(() => {
		const items = accepted.data?.items ?? [];
		const needle = query.trim().toLowerCase();

		if (needle.length === 0) return items;

		return items.filter((item) => item.party.fullName.toLowerCase().includes(needle));
	}, [accepted.data, query]);

	const renderRow = useCallback(
		({ item }: { item: ApiConnection }) => (
			<ConnectionRow
				avatarUrl={item.party.avatarUrl}
				fullName={item.party.fullName}
				id={item.party.id}
				meta={connectionMeta(item)}
				onOpen={openPerson}
			/>
		),
		[openPerson],
	);

	function renderBody() {
		if (filter !== "recent") {
			return <StateMessage message={NEEDS_SAFETY_DATA} />;
		}

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
			);
		}

		if (results.length === 0) {
			return (
				<StateMessage
					message={
						query.trim().length > 0
							? `No connection matches "${query.trim()}".`
							: "No connections yet. Connect with people near you from Discover."
					}
				/>
			);
		}

		return (
			<FlatList
				contentContainerStyle={styles.list}
				data={results}
				keyExtractor={(item) => item.id}
				renderItem={renderRow}
				showsVerticalScrollIndicator={false}
			/>
		);
	}

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Safety Connections" />

				<SearchField
					accessibilityLabel="Search your connections"
					onChangeText={setQuery}
					onSubmit={() => undefined}
					placeholder="Search..."
					value={query}
				/>

				<ChipGroup
					accessibilityLabel="Filter connections"
					onSelect={setFilter}
					options={FILTERS}
					scrollable
					selectedId={filter}
				/>

				<View style={styles.body}>{renderBody()}</View>
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
	body: {
		flex: 1,
	},
	list: {
		gap: Spacing.two,
		paddingBottom: Spacing.four,
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
