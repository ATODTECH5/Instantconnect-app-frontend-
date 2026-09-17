function groupThousands(value: number) {
	const [whole, fraction] = Math.abs(value).toFixed(0).split(".");
	const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	const sign = value < 0 ? "-" : "";

	return fraction ? `${sign}${grouped}.${fraction}` : `${sign}${grouped}`;
}

export function formatPrice(amount: number, currencySymbol: string) {
	if (amount <= 0) return "Free";

	return `${currencySymbol}${groupThousands(amount)}`;
}

export function formatDistance(kilometres: number) {
	if (kilometres < 1) return "Nearby";

	return `${groupThousands(kilometres)}km away`;
}

export function formatWalk(metres: number, walkMinutes: number) {
	const distance = metres >= 1000 ? `${(metres / 1000).toFixed(1)}km` : `${metres}m`;

	return `${distance} • ${walkMinutes} min away`;
}

export function formatRating(rating: number, area: string) {
	return `${rating.toFixed(1)} • ${area}`;
}

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

/**
 * Hand formatted rather than going through `Intl`, so the artboard's wording
 * holds whatever locale the device is set to.
 */
export function formatSchedule(startsAt: string) {
	const date = new Date(startsAt);

	if (Number.isNaN(date.getTime())) return "";

	const hours = date.getHours();
	const meridiem = hours < 12 ? "AM" : "PM";
	const hour12 = hours % 12 === 0 ? 12 : hours % 12;
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} • ${hour12}:${minutes} ${meridiem}`;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** "2 hours ago", "yesterday", "3 days ago"; older than a month reads as a date. */
export function formatTimeAgo(iso: string, now: Date = new Date()): string {
	const at = new Date(iso);
	const elapsed = now.getTime() - at.getTime();

	if (Number.isNaN(at.getTime())) return "";
	if (elapsed < MINUTE_MS) return "just now";

	if (elapsed < HOUR_MS) {
		const minutes = Math.floor(elapsed / MINUTE_MS);

		return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	}

	if (elapsed < DAY_MS) {
		const hours = Math.floor(elapsed / HOUR_MS);

		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	}

	const days = Math.floor(elapsed / DAY_MS);

	if (days === 1) return "yesterday";
	if (days < 31) return `${days} days ago`;

	return `on ${MONTHS[at.getMonth()]} ${at.getDate()}, ${at.getFullYear()}`;
}
