import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommunityCard } from "@/components/communities/community-card";
import { CommunityRow } from "@/components/communities/community-row";
import { HeaderPill } from "@/components/communities/header-pill";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { SearchField } from "@/components/ui/search-field";
import { StateMessage } from "@/components/ui/state-message";
import { Toast } from "@/components/ui/toast";
import { Brand, Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { COMMUNITY_PAGE } from "@/features/communities/community-service";
import { useCommunities, useJoinCommunity } from "@/features/communities/use-communities";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { describeError } from "@/lib/api/api-error";
import type { ApiCommunitySummary } from "@/lib/api/community-schema";

const SUGGESTED_COUNT = 10;

type Tab = "communities" | "mine" | "all";

const TABS: ChipOption[] = [
	{ id: "communities", label: "Communities" },
	{ id: "mine", label: "My groups" },
	{ id: "all", label: "All" },
];

function isTab(id: string): id is Tab {
	return id === "communities" || id === "mine" || id === "all";
}

/**
 * Communities: the viewer's own with suggestions under them. My groups: the
 * ones they created. All: everything they can see, to browse and join.
 */
export default function CommunitiesScreen() {
	const [tab, setTab] = useState<Tab>("communities");
	const [query, setQuery] = useState("");
	const search = useDebouncedValue(query.trim());

	const joined = useCommunities("joined", COMMUNITY_PAGE, search, tab === "communities");
	const suggested = useCommunities("suggested", SUGGESTED_COUNT, search, tab === "communities");
	const mine = useCommunities("mine", COMMUNITY_PAGE, search, tab === "mine");
	const all = useCommunities("all", COMMUNITY_PAGE, search, tab === "all");
	const join = useJoinCommunity();
	const [error, setError] = useState<string | null>(null);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/connection");
	}, []);

	const openCommunity = useCallback((id: string) => router.push(`/communities/${id}`), []);

	const joinCommunity = useCallback(
		(id: string) => join.mutate(id, { onError: (cause) => setError(describeError(cause)) }),
		[join],
	);

	const renderRow = useCallback(
		({ item }: { item: ApiCommunitySummary }) => (
			<CommunityRow
				community={item}
				isJoining={join.isPending && join.variables === item.id}
				onJoin={joinCommunity}
				onOpen={openCommunity}
				variant={tab === "mine" ? "open" : "join"}
			/>
		),
		[join.isPending, join.variables, joinCommunity, openCommunity, tab],
	);

	const sections = useMemo(
		() => [
			{ key: "joined", title: "Your Communities", data: joined.data?.items ?? [] },
			{ key: "suggested", title: "Suggested Communities", data: suggested.data?.items ?? [] },
		],
		[joined.data, suggested.data],
	);

	const listQuery = tab === "mine" ? mine : all;
	const searching = search.length > 0;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader
					onBack={goBack}
					title="Communities"
					trailing={
						<HeaderPill
							accessibilityHint="Opens Create Community"
							label="Create"
							onPress={() => router.push("/communities/new")}
						/>
					}
				/>

				<SearchField
					accessibilityLabel="Search communities by name"
					onChangeText={setQuery}
					onSubmit={() => undefined}
					placeholder="Search communities..."
					value={query}
				/>

				<ChipGroup
					accessibilityLabel="Community lists"
					onSelect={(id) => {
						if (isTab(id)) setTab(id);
					}}
					options={TABS}
					selectedId={tab}
				/>

				{tab === "communities" ? (
					joined.isPending ? (
						<StateMessage message="Loading communities…" />
					) : joined.isError ? (
						<StateMessage
							actionLabel="Try again"
							isError
							message={describeError(joined.error)}
							onPressAction={() => void joined.refetch()}
						/>
					) : (
						<SectionList
							contentContainerStyle={styles.list}
							keyExtractor={(item) => item.id}
							refreshControl={
								<RefreshControl
									onRefresh={() => {
										void joined.refetch();
										void suggested.refetch();
									}}
									refreshing={joined.isRefetching}
									tintColor={Brand.purple}
								/>
							}
							renderItem={({ item, section }) =>
								section.key === "joined" ? (
									<CommunityCard community={item} onOpen={openCommunity} />
								) : (
									renderRow({ item })
								)
							}
							renderSectionFooter={({ section }) =>
								section.data.length === 0 ? (
									<Text style={styles.sectionEmpty}>
										{section.key === "joined"
											? searching
												? "None of your communities match."
												: "Join a community below, or create your own."
											: searching
												? "No other communities match."
												: "No suggestions right now. Check All to browse."}
									</Text>
								) : null
							}
							renderSectionHeader={({ section }) => (
								<Text accessibilityRole="header" style={styles.sectionTitle}>
									{section.title}
								</Text>
							)}
							sections={sections}
							showsVerticalScrollIndicator={false}
							stickySectionHeadersEnabled={false}
						/>
					)
				) : listQuery.isPending ? (
					<StateMessage message="Loading communities…" />
				) : listQuery.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(listQuery.error)}
						onPressAction={() => void listQuery.refetch()}
					/>
				) : (
					<FlatList
						ListEmptyComponent={
							<StateMessage
								message={
									searching
										? "No communities match that name."
										: tab === "mine"
											? "Communities you create will appear here."
											: "There are no communities to browse yet."
								}
							/>
						}
						ListHeaderComponent={
							tab === "mine" ? (
								<Text accessibilityRole="header" style={styles.sectionTitle}>
									My Groups
								</Text>
							) : null
						}
						contentContainerStyle={styles.list}
						data={listQuery.data.items}
						keyExtractor={(item) => item.id}
						refreshControl={
							<RefreshControl
								onRefresh={() => void listQuery.refetch()}
								refreshing={listQuery.isRefetching}
								tintColor={Brand.purple}
							/>
						}
						renderItem={renderRow}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>

			{error ? <Toast message={error} onDismiss={() => setError(null)} tone="error" /> : null}
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
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	list: {
		gap: Gap.card,
		paddingBottom: Spacing.five,
	},
	sectionTitle: {
		...Type.sectionTitle,
		color: Ink.title,
		paddingTop: Spacing.two,
	},
	sectionEmpty: {
		...Type.resultMeta,
		color: Ink.meta,
	},
});
