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
