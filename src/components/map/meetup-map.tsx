import { requireOptionalNativeModule } from "expo";
import { Platform, StyleSheet, View } from "react-native";

import { Brand, Ink, Radius } from "@/constants/theme";
import type { Coordinates } from "@/features/location/geocoding";

// Same guard as MapSurface: expo-maps throws from its module body when the
// native side is missing, and Expo Router requires every route eagerly.
const ExpoMaps: typeof import("expo-maps") | null =
	requireOptionalNativeModule("ExpoMaps") !== null
		? // eslint-disable-next-line @typescript-eslint/no-require-imports
			(require("expo-maps") as typeof import("expo-maps"))
		: null;

const ZOOM = 15;
const HEIGHT = 220;

export type MeetupMapProps = {
	venue: Coordinates | null;
	me: Coordinates | null;
	party: Coordinates | null;
	partyName: string;
};

/**
 * Three pins at most, centred on the venue when there is one and on
 * whoever is known otherwise. Read-only: the meetup screen is about where
 * people are, not about picking a place.
 */
export function MeetupMap({ venue, me, party, partyName }: MeetupMapProps) {
	const center = venue ?? party ?? me;

	if (!ExpoMaps || !center) {
		return <View style={styles.placeholder} />;
	}

	const markers = [
		venue ? { coordinates: venue, title: "Venue", tintColor: Brand.purple } : null,
		me ? { coordinates: me, title: "You", tintColor: Ink.success } : null,
		party ? { coordinates: party, title: partyName, tintColor: Brand.pink } : null,
	].filter((marker): marker is NonNullable<typeof marker> => marker !== null);

	const cameraPosition = { coordinates: center, zoom: ZOOM };

	if (Platform.OS === "ios") {
		return (
			<ExpoMaps.AppleMaps.View
				cameraPosition={cameraPosition}
				markers={markers}
				style={styles.map}
			/>
		);
	}

	return (
		<ExpoMaps.GoogleMaps.View
			cameraPosition={cameraPosition}
			markers={markers.map(({ tintColor: _tint, ...marker }) => marker)}
			style={styles.map}
		/>
	);
}

const styles = StyleSheet.create({
	map: {
		height: HEIGHT,
		borderRadius: Radius.media,
		overflow: "hidden",
	},
	placeholder: {
		height: HEIGHT,
		borderRadius: Radius.media,
		backgroundColor: Ink.bubbleIncoming,
	},
});
