import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Everything static lives in app.json; this file exists only to inject the
 * Android Google Maps key from the environment, since a key committed to the
 * repo would ship inside the bundle.
 *
 * Set GOOGLE_MAPS_ANDROID_API_KEY in .env (or in the EAS build secrets) before
 * building for Android, or the map renders as blank tiles.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
	const googleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

	return {
		...config,
		name: config.name ?? "Instant Connect",
		slug: config.slug ?? "instant-connect-client",
		android: {
			...config.android,
			...(googleMapsApiKey ? { config: { googleMaps: { apiKey: googleMapsApiKey } } } : null),
		},
	};
};
