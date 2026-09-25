import {
	Accuracy,
	PermissionStatus,
	geocodeAsync,
	getCurrentPositionAsync,
	requestForegroundPermissionsAsync,
	reverseGeocodeAsync,
} from "expo-location";

export type Coordinates = {
	latitude: number;
	longitude: number;
};

/** Lagos, so the map opens on somewhere real while a fix is still pending. */
export const FALLBACK_COORDINATES: Coordinates = {
	latitude: 6.5795,
	longitude: 3.3711,
};

export type LocationPermission = "granted" | "denied" | "blocked";

export async function requestLocationPermission(): Promise<LocationPermission> {
	try {
		const { status, canAskAgain } = await requestForegroundPermissionsAsync();

		if (status === PermissionStatus.GRANTED) return "granted";

		// Once the OS stops offering the prompt, only Settings can undo it, so the
		// screen has to say that rather than offer a retry that cannot work.
		return canAskAgain ? "denied" : "blocked";
	} catch {
		return "denied";
	}
}

export async function getCurrentCoordinates(): Promise<Coordinates | null> {
	try {
		const position = await getCurrentPositionAsync({ accuracy: Accuracy.Balanced });

		return {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
		};
	} catch {
		return null;
	}
}

export type ResolvedAddress = {
	/** Street line, e.g. "12 Allen Avenue, Ikeja, Lagos | 101233, Nigeria". */
	line: string;
	/** Nearby landmark or area, e.g. "Close to Item 7 Shawarma. Lagos, Nigeria". */
	context: string | null;
};

const joinParts = (parts: (string | null | undefined)[], separator: string) =>
	parts.filter((part): part is string => Boolean(part && part.trim())).join(separator);

/**
 * The geocoder fills different fields per platform and per place, so the line is
 * assembled from whatever came back rather than from a fixed template.
 */
export async function resolveAddress(coordinates: Coordinates): Promise<ResolvedAddress | null> {
	try {
		const [address] = await reverseGeocodeAsync(coordinates);

		if (!address) return null;

		const street = joinParts([address.streetNumber, address.street], " ");
		const locality = joinParts([address.district, address.city, address.region], ", ");
		const postal = joinParts([address.postalCode, address.country], ", ");

		const line =
			joinParts([joinParts([street, locality], ", "), postal], " | ") ||
			address.formattedAddress ||
			address.name;

		if (!line) return null;

		const landmark = address.name && address.name !== street ? address.name : null;

		return {
			line,
			context: landmark
				? joinParts(
						[`Close to ${landmark}`, joinParts([address.city, address.country], ", ")],
						". ",
					) || null
				: null,
		};
	} catch {
		return null;
	}
}

export async function searchPlace(query: string): Promise<Coordinates | null> {
	const trimmed = query.trim();

	if (!trimmed) return null;

	try {
		const [match] = await geocodeAsync(trimmed);

		if (!match) return null;

		return { latitude: match.latitude, longitude: match.longitude };
	} catch {
		return null;
	}
}

export type VenueCandidate = Coordinates & {
	name: string;
	address: string | null;
};

const MAX_VENUE_RESULTS = 5;

/**
 * The platform geocoder answers with points, not places, so each point is
 * reverse geocoded for something to show. Where it knows a landmark name that
 * becomes the venue; otherwise the words the host typed are, since that is the
 * name they have in mind.
 */
export async function searchVenues(query: string): Promise<VenueCandidate[]> {
	const trimmed = query.trim();

	if (!trimmed) return [];

	try {
		const matches = (await geocodeAsync(trimmed)).slice(0, MAX_VENUE_RESULTS);

		return await Promise.all(
			matches.map(async ({ latitude, longitude }) => {
				const [place] = await reverseGeocodeAsync({ latitude, longitude });
				const street = joinParts([place?.streetNumber, place?.street], " ");
				const landmark = place?.name && place.name !== street ? place.name : null;
				const address =
					joinParts([street, place?.district ?? place?.city, place?.region], ", ") ||
					place?.formattedAddress ||
					null;

				return { latitude, longitude, name: landmark ?? trimmed, address };
			}),
		);
	} catch {
		return [];
	}
}

/** Where the device is now, named by its street address for a venue field. */
export async function currentVenue(): Promise<VenueCandidate | null> {
	const coordinates = await getCurrentCoordinates();

	if (!coordinates) return null;

	const resolved = await resolveAddress(coordinates);
	const line = resolved?.line ?? null;

	return {
		...coordinates,
		name: line?.split(",")[0]?.trim() || "Current location",
		address: line,
	};
}
