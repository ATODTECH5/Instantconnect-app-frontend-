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
