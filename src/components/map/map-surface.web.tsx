import { MapUnavailable } from "@/components/map/map-unavailable";

import type { MapSurfaceProps } from "@/components/map/map-surface";

const UNAVAILABLE_MESSAGE =
	"Map preview is not available on web. Open the app on iOS or Android to choose your location.";

/** `expo-maps` is iOS and Android only, so the web build never imports it. */
export function MapSurface({ center, onCenterSettled }: MapSurfaceProps) {
	return (
		<MapUnavailable
			center={center}
			message={UNAVAILABLE_MESSAGE}
			onCenterSettled={onCenterSettled}
		/>
	);
}
