const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/**
 * The stamp on the right of a chat row.
 *
 * The frame mixes "10:42 PM" on its two newest rows with "5 hours ago" on the
 * next two, which cannot both be a rule. Today reads as a clock time, since
 * that is what the rows a user actually looks at show, and everything older
 * steps down through Yesterday, a weekday, then a date.
 */
export function messageTime(iso: string, now: Date = new Date()): string {
	const at = new Date(iso);
	const elapsed = now.getTime() - at.getTime();

	if (elapsed < MINUTE_MS) return "Now";

	const isToday = at.toDateString() === now.toDateString();

	if (isToday) {
		return at.toLocaleTimeString(undefined, {
			hour: "numeric",
			minute: "2-digit",
		});
	}

	if (elapsed < 2 * DAY_MS) return "Yesterday";

	if (elapsed < WEEK_MS) {
		return at.toLocaleDateString(undefined, { weekday: "long" });
	}

	return at.toLocaleDateString(undefined, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

/** The stamp under a bubble, which the frame always shows as a clock time. */
export function clockTime(iso: string): string {
	return new Date(iso).toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
	});
}
