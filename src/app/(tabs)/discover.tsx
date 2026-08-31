import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SectionHeader } from "@/components/home/section-header";
import { PickerSheet } from "@/components/profile/picker-sheet";
import { PersonCard } from "@/components/home/person-card";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { SearchField } from "@/components/ui/search-field";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import type { ApiNearbyPerson } from "@/lib/api/discovery-schema";
import { connectActionFor } from "@/features/discover/connect-action";
import { useConnectRequests } from "@/features/discover/use-connect-requests";
import { useDiscoverPeople } from "@/features/discover/use-discover";
import { CATEGORIES, findCategory } from "@/features/reference/categories";
import { useNavBarInset } from "@/hooks/use-nav-bar-inset";

const EDGE_INSET = Spacing.three;
/** Off the frame: two 174pt cards inside a 361pt column. */
const CARD_GAP = 13;
const COLUMNS = 2;

export default function DiscoverScreen() {
	const navInset = useNavBarInset();
	const { width } = useWindowDimensions();
	const { attemptFor, connect } = useConnectRequests();

	const [categoryId, setCategoryId] = useState("general");
	const [isPickingCategory, setIsPickingCategory] = useState(false);
	const [query, setQuery] = useState("");

	const people = useDiscoverPeople(categoryId);
	const category = findCategory(categoryId);

	const columnWidth = useMemo(() => {
		const column = Math.min(width, MaxColumnWidth) - EDGE_INSET * 2;

		return Math.floor((column - CARD_GAP * (COLUMNS - 1)) / COLUMNS);
	}, [width]);

	const openSearch = useCallback(
		(params?: Record<string, string>) => router.push({ pathname: "/search", params }),
		[],
	);

	const handleSearch = useCallback(() => {
		const trimmed = query.trim();
		if (trimmed.length > 0) openSearch({ q: trimmed });
	}, [openSearch, query]);

	const openPerson = useCallback((id: string) => router.push(`/person/${id}`), []);

	const renderPerson = useCallback(
		({ item }: { item: ApiNearbyPerson }) => (
			<PersonCard
				action={connectActionFor(item.connectionState, attemptFor(item.id))}
				onConnect={connect}
				onOpen={openPerson}
				person={item}
				width={columnWidth}
			/>
		),
		[attemptFor, columnWidth, connect, openPerson],
	);

	function renderBody() {
		if (people.isPending) {
			return (
				<View style={styles.centre}>
					<GradientSpinner />

					<Text style={styles.loadingLabel}>Finding people near you</Text>
				</View>
			);
		}

		if (people.isError || !people.data) {
			return (
				<View style={styles.centre}>
					<StateMessage
						actionLabel="Try again"
						isError
						message="We could not load Discover. Check your connection and try again."
						onPressAction={() => void people.refetch()}
					/>
				</View>
			);
		}

		return (
			<FlatList
				ListEmptyComponent={
					<View style={styles.centre}>
						<StateMessage message="No one under this category is near you yet. Try another one, or widen your area." />
					</View>
				}
				columnWrapperStyle={styles.row}
				contentContainerStyle={[
					styles.list,
					{ paddingBottom: navInset + Spacing.four },
				]}
				data={people.data.items}
				keyExtractor={(person) => person.id}
				numColumns={COLUMNS}
				onRefresh={() => void people.refetch()}
				refreshing={people.isRefetching}
				renderItem={renderPerson}
				showsVerticalScrollIndicator={false}
			/>
		);
	}

	return (
		<SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<Text accessibilityRole="header" style={styles.screenTitle}>
					Discover
				</Text>

				<View style={styles.search}>
					<SearchField
						accessibilityLabel="Search people, talents and businesses"
						onChangeText={setQuery}
						onOpenFilters={() => openSearch({ filters: "open" })}
						onSubmit={handleSearch}
						placeholder="Search people, talents, businesses..."
						value={query}
					/>
				</View>

				<View style={styles.section}>
					<SectionHeader
						actionHint="Changes the category you are browsing"
						actionLabel={category?.label ?? "General"}
						onPressAction={() => setIsPickingCategory(true)}
						title="Matches"
					/>
				</View>
			</View>

			{renderBody()}

			<PickerSheet
				onChange={(ids) => setCategoryId(ids[0] ?? "general")}
				onClose={() => setIsPickingCategory(false)}
				options={CATEGORIES.map(({ id, label, Icon }) => ({ id, label, Icon }))}
				title="Category"
				value={[categoryId]}
				visible={isPickingCategory}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	column: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
	},
	screenTitle: {
		...Type.screenTitle,
		color: Ink.title,
	},
	search: {
		marginTop: Gap.section,
	},
	section: {
		marginTop: Spacing.four,
		marginBottom: Gap.snug,
	},
	list: {
		flexGrow: 1,
		gap: Spacing.three,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
	},
	row: {
		gap: CARD_GAP,
	},
	centre: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Gap.card,
		paddingHorizontal: EDGE_INSET,
		paddingVertical: Spacing.six,
	},
	loadingLabel: {
		...Type.promoBody,
		color: Ink.muted,
	},
});
