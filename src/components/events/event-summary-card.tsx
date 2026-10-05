import { memo } from "react";

import { EventListCard } from "@/components/events/event-list-card";
import type { ApiEventSummary } from "@/lib/api/event-schema";
import { formatDistance, formatSchedule } from "@/utils/format";

export type EventSummaryCardProps = {
	/** `distanceKm` comes with nearby events, and is shown when present. */
	event: ApiEventSummary & { distanceKm?: number };
	actionLabel: string;
	onOpen: (id: string) => void;
};

/** An event from the server as a list card, with the faces of people going. */
export const EventSummaryCard = memo(function EventSummaryCard({
	event,
	actionLabel,
	onOpen,
}: EventSummaryCardProps) {
	const faces = event.attendeePreview;

	return (
		<EventListCard
			actionLabel={actionLabel}
			countLabel={`${event.attendeeCount} attending`}
			distanceLabel={
				event.distanceKm === undefined ? undefined : formatDistance(event.distanceKm)
			}
			extraFaces={event.attendeeCount - faces.length}
			faces={faces}
			id={event.id}
			onOpen={onOpen}
			photo={event.coverUrl ? { uri: event.coverUrl } : null}
			registration={event}
			scheduleLabel={formatSchedule(event.startsAt)}
			title={event.title}
			venue={event.venue.name}
		/>
	);
});
