import {
	Accuracy,
	type LocationSubscription,
	watchPositionAsync,
} from "expo-location";
import { useEffect, useRef, useState } from "react";

import {
	type LocationPermission,
	requestLocationPermission,
} from "@/features/location/geocoding";

/**
 * Foreground only, by design of the current build: there is no background
 * mode in the binary and no task manager in the bundle, so fixes flow while
 * this hook is mounted and stop the moment it is not. The screen says so.
 *
 * Reports are gated by both distance and time so a parked phone does not
 * post the same point every second, and a moving one does not go quiet.
 */
const MIN_INTERVAL_MS = 10_000;
const MIN_DISTANCE_M = 15;

export type LiveFix = { latitude: number; longitude: number; accuracyM?: number };

export type LiveLocationState = {
	permission: LocationPermission | "unknown";
	isWatching: boolean;
};

export function useLiveLocation(
	enabled: boolean,
	onFix: (fix: LiveFix) => void,
): LiveLocationState {
	const [permission, setPermission] = useState<LocationPermission | "unknown">("unknown");
	const [isWatching, setWatching] = useState(false);
	const latest = useRef(onFix);

	useEffect(() => {
		latest.current = onFix;
	}, [onFix]);

	useEffect(() => {
		if (!enabled) return;

		let subscription: LocationSubscription | null = null;
		let cancelled = false;

		void (async () => {
			const granted = await requestLocationPermission();

			if (cancelled) return;

			setPermission(granted);

			if (granted !== "granted") return;

			subscription = await watchPositionAsync(
				{
					accuracy: Accuracy.High,
					timeInterval: MIN_INTERVAL_MS,
					distanceInterval: MIN_DISTANCE_M,
				},
				(position) => {
					latest.current({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
						accuracyM: position.coords.accuracy ?? undefined,
					});
				},
			);

			if (cancelled) {
				subscription.remove();
			} else {
				setWatching(true);
			}
		})();

		return () => {
			cancelled = true;
			subscription?.remove();
			setWatching(false);
		};
	}, [enabled]);

	return { permission, isWatching };
}
