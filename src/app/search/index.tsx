import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SparkleIcon from "@/assets/home/sparkle.svg";
import { CategoryStrip } from "@/components/home/category-strip";
import { SectionHeader } from "@/components/home/section-header";
import { PersonRow } from "@/components/search/person-row";
import { PlaceRow } from "@/components/search/place-row";
import { buildSections, ResultSections } from "@/components/search/result-sections";
import { SearchScreenHeader } from "@/components/search/search-screen-header";
import { SearchTermRow } from "@/components/search/search-term-row";
import { ChipGroup } from "@/components/ui/chip-group";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { PromoCard } from "@/components/ui/promo-card";
import { SearchField } from "@/components/ui/search-field";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { useSearchConnect } from "@/features/search/use-search-connect";
import {
	countActiveFilters,
	decodeFilters,
	POPULAR_SEARCHES,
	SEARCH_TABS,
	isSearchTabId,
	type SearchTabId,
} from "@/features/search/search-filters";
import { useSearchHistory } from "@/features/search/search-history";
import { useJoinMeetups } from "@/features/search/use-join-meetups";
import { useSearchResults, useSearchSuggestions } from "@/features/search/use-search";
import { isEmptyResults } from "@/features/search/search-catalog";
import { useNavBarInset } from "@/hooks/use-nav-bar-inset";

const EmptySearchArt = require("@/assets/search/empty-search.png");

const EDGE_INSET = Spacing.three;

const POPULAR_OPTIONS = POPULAR_SEARCHES.map((label) => ({ id: label, label }));

export default function SearchScreen() {
	const params = useLocalSearchParams<{
		q?: string;
		tab?: string;
		category?: string;
		filters?: string;
	}>();

	const navInset = useNavBarInset();
	const { recents, remember, forget, clear } = useSearchHistory();
	const { stateFor: connectionFor, connect } = useSearchConnect();
	const { stateFor: joinStateFor, join } = useJoinMeetups();

	const [query, setQuery] = useState(params.q ?? "");
	const [submitted, setSubmitted] = useState<string | null>(params.q ?? null);
	const [tab, setTab] = useState<SearchTabId>(
		params.tab && isSearchTabId(params.tab) ? params.tab : "all",
	);

	const filters = useMemo(() => decodeFilters(params.filters), [params.filters]);
	const filterCount = countActiveFilters(filters);

	const isSearching = submitted !== null;
	const isTyping = !isSearching && query.trim().length > 0;

	const suggestions = useSearchSuggestions(isTyping ? query : "");
	const results = useSearchResults({
		query: submitted ?? query,
		tab,
		filters,
		enabled: isSearching || isTyping,
	});

	const runSearch = useCallback(
		(term: string) => {
			const trimmed = term.trim();

			setQuery(trimmed);
			setSubmitted(trimmed);
			remember(trimmed);
		},
		[remember],
	);

	const handleChangeText = useCallback((next: string) => {
		setQuery(next);
		// Editing after a search returns to suggestions rather than leaving stale
		// results under a query that no longer produced them.
		setSubmitted(null);
	}, []);

	const openFilters = useCallback(() => {
		router.push({
			pathname: "/search/filters",
			params: { filters: params.filters ?? "" },
		});
	}, [params.filters]);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/(tabs)");
	}, []);

	const openPerson = useCallback((id: string) => router.push(`/person/${id}`), []);
	const openPlace = useCallback(() => {}, []);
	const openMeetup = useCallback(() => {}, []);

	const sections = useMemo(
		() => (results.data ? buildSections(results.data, tab !== "all") : []),
		[results.data, tab],
	);

	const header = (
		<View style={styles.padded}>
			<SearchScreenHeader onBack={goBack} title="Search" />

			<View style={styles.field}>
				<SearchField
					accessibilityLabel="Search people, talents and businesses"
					autoFocus={!params.q}
					filterCount={filterCount}
					onChangeText={handleChangeText}
					onOpenFilters={openFilters}
					onSubmit={() => runSearch(query)}
					placeholder="Search people, talents, businesses..."
					value={query}
				/>
			</View>
		</View>
	);

	const renderBusy = (label: string) => (
		<View style={styles.centred}>
			<GradientSpinner />

			<Text style={styles.busyLabel}>{label}</Text>
		</View>
	);

	const renderError = () => (
		<View style={[styles.padded, styles.errorBox]}>
			<StateMessage
				actionLabel="Try again"
				isError
				message="We could not run that search. Check your connection and try again."
				onPressAction={() => void results.refetch()}
			/>
		</View>
	);

	function renderIdle() {
		return (
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: navInset + Spacing.four },
				]}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.column}>
					<SectionHeader title="Popular Searches" />

					<View style={styles.block}>
						<ChipGroup
							accessibilityHintFor={(option) => `Searches for ${option.label}`}
							accessibilityLabel="Popular searches"
							onSelect={runSearch}
							options={POPULAR_OPTIONS}
						/>
					</View>

					<View style={styles.block}>
						<CategoryStrip
							onSelect={(id) => runSearch(id)}
							title="Explore Categories"
						/>
					</View>

					{recents.length > 0 ? (
						<View style={styles.block}>
							<SectionHeader
								actionLabel="Clear all"
								onPressAction={clear}
								title="Recent Result"
							/>

							<View style={styles.rows}>
								{recents.map((term) => (
									<SearchTermRow
										key={term}
										onPress={runSearch}
										onRemove={forget}
										term={term}
									/>
								))}
							</View>
						</View>
					) : null}

					<View style={styles.block}>
						<PromoCard
							Icon={SparkleIcon}
							accessibilityHint="Opens AI assisted search"
							actionLabel="Ask AI"
							body="Describe what you're looking for and let the AI help you find the best matches"
							onPress={() => runSearch("AI")}
							title="Try AI Search"
						/>
					</View>
				</View>
			</ScrollView>
		);
	}

	function renderSuggesting() {
		if (suggestions.isPending) return renderBusy("Looking for matches");

		const terms = suggestions.data ?? [];

		return (
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: navInset + Spacing.four },
				]}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.column}>
					<SectionHeader title="Suggestions" />

					{terms.length > 0 ? (
						<View style={styles.rows}>
							{terms.map((term, index) => (
								<SearchTermRow
									highlighted={index === 0}
									key={term}
									onPress={runSearch}
									term={term}
									variant="suggestion"
								/>
							))}
						</View>
					) : (
						<Text style={styles.busyLabel}>No suggestions for “{query.trim()}”.</Text>
					)}

					{results.data?.people.length ? (
						<View style={styles.block}>
							<SectionHeader title="People" />

							<View style={styles.rows}>
								{results.data.people.map((person) => (
									<PersonRow
										connectionState={connectionFor(person.id)}
										key={person.id}
										onConnect={connect}
										onOpen={openPerson}
										person={person}
									/>
								))}
							</View>
						</View>
					) : null}

					{results.data?.places.length ? (
						<View style={styles.block}>
							<SectionHeader title="Places" />

							<View style={styles.rows}>
								{results.data.places.map((place) => (
									<PlaceRow key={place.id} onOpen={openPlace} place={place} />
								))}
							</View>
						</View>
					) : null}
				</View>
			</ScrollView>
		);
	}

	function renderResults() {
		if (results.isPending) return renderBusy("Searching");
		if (results.isError || !results.data) return renderError();

		if (isEmptyResults(results.data)) {
			return (
				<ScrollView
					contentContainerStyle={[
						styles.scrollContent,
						{ paddingBottom: navInset + Spacing.four },
					]}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.column}>
						<SectionHeader title="No search result" />
					</View>

					<EmptyState
						illustration={EmptySearchArt}
						body={
							(submitted ?? "").length === 0
								? "No search has been made yet, you will see all your search result here."
								: `Nothing matched “${submitted}”. Try another search or widen your filters.`
						}
						title="Nothing To show here"
					/>
				</ScrollView>
			);
		}

		return (
			<ResultSections
				connectionFor={connectionFor}
				contentInset={navInset + Spacing.four}
				joinStateFor={joinStateFor}
				onConnect={connect}
				onJoinMeetup={join}
				onOpenMeetup={openMeetup}
				onOpenPerson={openPerson}
				onOpenPlace={openPlace}
				sections={sections}
			/>
		);
	}

	return (
		<SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
			<StatusBar style="dark" />

			{header}

			{isSearching ? (
				<View style={styles.tabs}>
					<ChipGroup
						accessibilityHintFor={(option) => `Shows ${option.label} results`}
						accessibilityLabel="Result categories"
						edgeInset={EDGE_INSET}
						onSelect={(id) => {
							if (isSearchTabId(id)) setTab(id);
						}}
						options={SEARCH_TABS}
						scrollable
						selectedId={tab}
					/>
				</View>
			) : null}

			{isSearching ? renderResults() : isTyping ? renderSuggesting() : renderIdle()}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	padded: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
	},
	field: {
		marginTop: Spacing.four,
	},
	tabs: {
		marginTop: Spacing.three,
	},
	scrollContent: {
		flexGrow: 1,
		paddingTop: Spacing.four,
	},
	column: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
	},
	block: {
		marginTop: Spacing.four,
	},
	rows: {
		marginTop: Spacing.two,
	},
	centred: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Gap.card,
		padding: Spacing.three,
	},
	busyLabel: {
		...Type.promoBody,
		color: Ink.muted,
		textAlign: "center",
	},
	errorBox: {
		marginTop: Spacing.five,
	},
});
