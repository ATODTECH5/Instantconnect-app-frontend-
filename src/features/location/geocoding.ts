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
