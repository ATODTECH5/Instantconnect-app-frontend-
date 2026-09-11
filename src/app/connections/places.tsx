import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MapIcon from "@/assets/connections/map.svg";
import { VisitedPlaceCard } from "@/components/connections/visited-place-card";
import { ScreenHeader } from "@/components/nav/screen-header";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { VISITED_PLACES, type VisitedPlace } from "@/features/connections/visited-places";

const EDGE_INSET = Spacing.three;
const MAP_ICON = 14;

export default function VisitedPlacesScreen() {
	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/connection");
	}, []);

	/**
	 * No `onOpen`. A place has nowhere to open until Places & Reviews lands:
	 * this used to push `/location`, which is the onboarding coordinate picker,
	 * so tapping a place offered a Select Location that wrote those coordinates
	 * to the signed in account's own profile. Wire this to the place detail
	 * route when it exists, not to the picker.
	 */
	const renderPlace = useCallback(
		({ item }: { item: VisitedPlace }) => <VisitedPlaceCard place={item} />,
		[],
	);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader
					onBack={goBack}
					title="Visited Places"
					trailing={
						<View
							accessible
							accessibilityLabel="Map view, available once places are on the map"
							style={[styles.mapPill, styles.unavailable]}
						>
							<MapIcon color={Brand.purple} height={MAP_ICON} width={MAP_ICON} />

							<Text style={styles.mapLabel}>Map</Text>
						</View>
					}
				/>

				{VISITED_PLACES.length === 0 ? (
					<StateMessage message="Places you visit during meetups will appear here." />
				) : (
					<FlatList
						contentContainerStyle={styles.list}
						data={VISITED_PLACES}
						keyExtractor={(item) => item.id}
						renderItem={renderPlace}
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
	mapPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.half,
		paddingHorizontal: Spacing.two,
		paddingVertical: Spacing.one,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurface,
	},
	mapLabel: {
		...Type.sectionLink,
		color: Brand.purple,
	},
	list: {
		gap: Gap.card,
		paddingBottom: Spacing.four,
	},
	unavailable: {
		opacity: 0.4,
	},
});
