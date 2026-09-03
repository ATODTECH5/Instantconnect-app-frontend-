import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { ChipGroup } from "@/components/ui/chip-group";
import { DistanceSlider } from "@/components/ui/distance-slider";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectField } from "@/components/ui/select-field";
import { Brand, Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { CATEGORY_OPTIONS } from "@/features/reference/categories";
import {
	decodeFilters,
	DISTANCE_STEPS,
	encodeFilters,
	LOOKING_FOR,
	ONLINE_STATUS,
	RATING_OPTIONS,
	type LookingForId,
	type OnlineStatusId,
	type RatingId,
} from "@/features/search/search-filters";

const EDGE_INSET = Spacing.three;



export default function FiltersScreen() {
	const params = useLocalSearchParams<{ filters?: string }>();
	const insets = useSafeAreaInsets();

	const [filters, setFilters] = useState(() => decodeFilters(params.filters));

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/search");
	}, []);

	const apply = useCallback(() => {
		// Replaces the search route rather than pushing, so applying twice does
		// not stack two searches behind the results.
		router.replace({
			pathname: "/search",
			params: { filters: encodeFilters(filters) },
		});
	}, [filters]);

	return (
		<SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
			<StatusBar style="dark" />

			<ScrollView
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + Spacing.four },
				]}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="Filter" />

					<Field label="I'm looking for">
						<ChipGroup
							accessibilityLabel="What you are looking for"
							onSelect={(id) =>
								setFilters((current) => ({
									...current,
									lookingFor: id as LookingForId,
								}))
							}
							options={LOOKING_FOR}
							selectedId={filters.lookingFor}
						/>
					</Field>

					<Field label="Category">
						<SelectField
							accessibilityLabel="Category"
							onChange={(categoryId) =>
								setFilters((current) => ({ ...current, categoryId }))
							}
							options={CATEGORY_OPTIONS}
							placeholder="Select a Category"
							sheetTitle="Select a Category"
							value={filters.categoryId}
						/>
					</Field>

					<Field label="Distance">
						<DistanceSlider
							label="Maximum distance"
							onChange={(distanceKm) =>
								setFilters((current) => ({ ...current, distanceKm }))
							}
							steps={DISTANCE_STEPS}
							value={filters.distanceKm}
						/>
					</Field>

					<Field label="Online Status">
						<ChipGroup
							accessibilityLabel="Online status"
							onSelect={(id) =>
								setFilters((current) => ({
									...current,
									onlineStatus: id as OnlineStatusId,
								}))
							}
							options={ONLINE_STATUS}
							selectedId={filters.onlineStatus}
						/>
					</Field>

					<Field label="Rating (Places & Businesses)">
						<ChipGroup
							accessibilityLabel="Minimum rating"
							onSelect={(id) =>
								setFilters((current) => ({ ...current, rating: id as RatingId }))
							}
							options={RATING_OPTIONS}
							selectedId={filters.rating}
						/>
					</Field>

					<Field label="Verified Only">
						<View style={styles.toggleRow}>
							<Text style={styles.toggleCopy}>
								Show only verified users and places
							</Text>

							<Switch
								accessibilityLabel="Verified only"
								accessibilityRole="switch"
								accessibilityState={{ checked: filters.verifiedOnly }}
								onValueChange={(verifiedOnly) =>
									setFilters((current) => ({ ...current, verifiedOnly }))
								}
								thumbColor={Ink.surface}
								trackColor={{ false: Ink.trackInactive, true: Brand.purple }}
								value={filters.verifiedOnly}
							/>
						</View>
					</Field>

					<View style={styles.apply}>
						<PrimaryButton
							accessibilityHint="Applies these filters to your search"
							label="Apply Filters"
							onPress={apply}
						/>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<View style={styles.field}>
			<Text accessibilityRole="header" style={styles.fieldLabel}>
				{label}
			</Text>

			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	content: {
		flexGrow: 1,
		paddingTop: Spacing.two,
	},
	column: {
		flexGrow: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
	},
	field: {
		gap: Gap.card,
		marginTop: Spacing.five,
	},
	fieldLabel: {
		...Type.filterLabel,
		color: Ink.title,
	},
	toggleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
	},
	toggleCopy: {
		...Type.rowLabel,
		flexShrink: 1,
		color: Ink.muted,
	},
	apply: {
		marginTop: Spacing.six,
	},
});
