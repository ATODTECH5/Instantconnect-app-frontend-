/**
 * The Propose a Time card is pills, not a calendar, and the app carries no
 * native date picker. A grid of the next few days by a handful of daytime
 * slots covers how people actually arrange to meet, and is enough to build a
 * proposal without a native module.
 */

export const SLOT_HOURS = [10, 12, 14, 16, 18, 20] as const;
export const DAYS_AHEAD = 6;
export const MAX_PROPOSED_TIMES = 5;

export type DayOption = { key: string; label: string; date: Date };

export function upcomingDays(now = new Date()): DayOption[] {
	const days: DayOption[] = [];

	for (let offset = 0; offset < DAYS_AHEAD; offset += 1) {
		const date = new Date(now);

		date.setDate(now.getDate() + offset);
		date.setHours(0, 0, 0, 0);

		days.push({
			key: date.toISOString(),
			label:
				offset === 0
					? "Today"
					: offset === 1
						? "Tomorrow"
						: date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }),
			date,
		});
	}

	return days;
}

export function slotIso(day: Date, hour: number): string {
	const slot = new Date(day);

	slot.setHours(hour, 0, 0, 0);

	return slot.toISOString();
}

export function isPast(iso: string, now = new Date()): boolean {
	return new Date(iso).getTime() <= now.getTime();
}

export function formatHour(hour: number): string {
	const date = new Date();

	date.setHours(hour, 0, 0, 0);

	return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** "Sat 20 Sep, 3:00 PM": the pill label and the confirmed card's time. */
export function formatSlot(iso: string): string {
	const date = new Date(iso);

	return `${date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}, ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}
