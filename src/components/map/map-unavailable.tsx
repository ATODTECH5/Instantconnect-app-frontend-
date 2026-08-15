import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AbsoluteFill, Ink, Spacing, Type } from "@/constants/theme";
import type { Coordinates } from "@/features/location/geocoding";

export type MapUnavailableProps = {
	message: string;
	center: Coordinates;
	onCenterSettled: (coordinates: Coordinates) => void;
};

/**
 * Stands in wherever the native map cannot run: on web, and in clients built
 * without `expo-maps` such as Expo Go. The starting coordinate is still
 * published so the address card and the CTA below stay usable rather than the
 * screen becoming a dead end.
 */
export function MapUnavailable({ message, center, onCenterSettled }: MapUnavailableProps) {
	const { latitude, longitude } = center;

	useEffect(() => {
		onCenterSettled({ latitude, longitude });
	}, [latitude, longitude, onCenterSettled]);

	return (
		<View style={styles.fallback}>
			<Text style={styles.message}>{message}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	fallback: {
		...AbsoluteFill,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.four,
		backgroundColor: Ink.land,
	},
	message: {
		...Type.featureBody,
		color: Ink.muted,
		textAlign: "center",
		maxWidth: 320,
	},
});
