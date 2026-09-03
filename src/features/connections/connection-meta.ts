import type { ApiConnection } from "@/lib/api/discovery-schema";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function relativeDay(value: Date, now: Date): string {
	const elapsed = now.getTime() - value.getTime();

	if (elapsed < HOUR_MS) return "Today";
	if (elapsed < DAY_MS) return "Today";
	if (elapsed < 2 * DAY_MS) return "Yesterday";
	if (elapsed < 7 * DAY_MS) return `${Math.floor(elapsed / DAY_MS)} days ago`;
	if (elapsed < 30 * DAY_MS) return `${Math.floor(elapsed / (7 * DAY_MS))} weeks ago`;

	return value.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * The design shows "Met Today, 9:45 AM at Café Bloom" under each name, which
 * needs meetup history. No meetups table exists yet, so this reports the
 * connection itself instead of inventing a meeting that never happened.
 * Swap the body for the meetup's time and venue once Phase 3 lands.
 */
export function connectionMeta(connection: ApiConnection, now: Date = new Date()): string {
	const stamp = connection.respondedAt ?? connection.createdAt;
	const when = relativeDay(new Date(stamp), now);
	const place = connection.party.locationLabel;

	if (connection.status === "pending") {
		return connection.isOutgoing ? `Request sent ${when.toLowerCase()}` : "Wants to connect";
	}

	return place ? `Connected ${when.toLowerCase()} • ${place}` : `Connected ${when.toLowerCase()}`;
}
