import { requireOptionalNativeModule } from "expo";
import { useCallback, useEffect, useRef } from "react";
import { Platform, StyleSheet } from "react-native";

import { MapUnavailable } from "@/components/map/map-unavailable";
import type { Coordinates } from "@/features/location/geocoding";

/**
 * expo-maps throws from its own module body when the native side is missing, so
 * it cannot be imported at the top. Expo Router eagerly requires every route
 * file at startup, which would turn that throw into a blank app rather than one
 * unavailable screen, and Expo Go never ships this module.
 */
const isNativeMapAvailable = requireOptionalNativeModule("ExpoMaps") !== null;

const ExpoMaps: typeof import("expo-maps") | null = isNativeMapAvailable
	? // eslint-disable-next-line @typescript-eslint/no-require-imports
		(require("expo-maps") as typeof import("expo-maps"))
	: null;

const UNAVAILABLE_MESSAGE =
	"The map needs a development build. Run the app in a dev build to pick your location, or continue and set it later.";

/** Street level, close enough that a pin reads as a specific address. */
const ZOOM = 16;

/**
 * `onCameraMove` fires on every frame of a pan, and acting on each one would be
 * a reverse geocode per frame, so the coordinate is published once movement
 * stops instead.
 */
const SETTLE_DELAY_MS = 400;

export type MapSurfaceProps = {
	/** Initial camera centre. Later changes recentre the map. */
	center: Coordinates;
	/** The coordinate under the pin, once the map has stopped moving. */
	onCenterSettled: (coordinates: Coordinates) => void;
	/** Fires as soon as the user starts moving the map. */
	onCenterMoving: () => void;
};

export function MapSurface({ center, onCenterSettled, onCenterMoving }: MapSurfaceProps) {
	const settle = useSettleTimer(onCenterSettled);
	const onCenterMovingRef = useLatest(onCenterMoving);

	// expo-maps reports both fields as optional, so the pair is only published
	// once both are actually present.
	const handleCameraMove = useCallback(
		({ latitude, longitude }: Partial<Coordinates>) => {
			if (latitude === undefined || longitude === undefined) return;

			onCenterMovingRef.current();
			settle({ latitude, longitude });
		},
		[onCenterMovingRef, settle],
	);

	// A module level constant, so this branch is stable for the component's whole
	// life and never reorders the hooks above.
	if (!ExpoMaps) {
		return (
			<MapUnavailable
				center={center}
				message={UNAVAILABLE_MESSAGE}
				onCenterSettled={onCenterSettled}
			/>
		);
	}

	const cameraPosition = { coordinates: center, zoom: ZOOM };

	if (Platform.OS === "ios") {
		return (
			<ExpoMaps.AppleMaps.View
				cameraPosition={cameraPosition}
				onCameraMove={({ coordinates }) => handleCameraMove(coordinates)}
				properties={{ isTrafficEnabled: false, selectionEnabled: false }}
				style={StyleSheet.absoluteFill}
				uiSettings={{ compassEnabled: false, myLocationButtonEnabled: false }}
			/>
		);
	}

	return (
		<ExpoMaps.GoogleMaps.View
			cameraPosition={cameraPosition}
			onCameraMove={({ coordinates }) => handleCameraMove(coordinates)}
			properties={{
				isBuildingEnabled: false,
				isTrafficEnabled: false,
				selectionEnabled: false,
			}}
			style={StyleSheet.absoluteFill}
			uiSettings={{
				compassEnabled: false,
				mapToolbarEnabled: false,
				myLocationButtonEnabled: false,
				zoomControlsEnabled: false,
			}}
		/>
	);
}

function useLatest<T>(value: T) {
	const ref = useRef(value);

	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref;
}

function useSettleTimer(onSettled: (coordinates: Coordinates) => void) {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onSettledRef = useLatest(onSettled);

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		},
		[],
	);

	return useCallback(
		(coordinates: Coordinates) => {
			if (timerRef.current) clearTimeout(timerRef.current);

			timerRef.current = setTimeout(() => onSettledRef.current(coordinates), SETTLE_DELAY_MS);
		},
		[onSettledRef],
	);
}
