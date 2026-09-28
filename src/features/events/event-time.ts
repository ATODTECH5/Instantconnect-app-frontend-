/** An event without an end time is over once it has started. */
export function hasEventEnded(event: { startsAt: string; endsAt: string | null }): boolean {
	return new Date(event.endsAt ?? event.startsAt).getTime() < Date.now();
}
