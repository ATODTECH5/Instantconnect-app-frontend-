import { memo } from "react";

import { EventListCard } from "@/components/events/event-list-card";
import type { RegisteredEvent } from "@/features/connections/registered-events";
import { formatDistance, formatSchedule } from "@/utils/format";

/** Faces beyond this collapse into the "+N" disc. */
const MAX_FACES = 3;

export type RegisteredEventCardProps = {
	event: RegisteredEvent;
	onOpen: (id: string) => void;
};

export const RegisteredEventCard = memo(function RegisteredEventCard({
	event,
	onOpen,
}: RegisteredEventCardProps) {
	const faces = event.attendees.slice(0, MAX_FACES).map((attendee) => attendee.avatar);

	return (
		<EventListCard
			actionLabel="View Ticket"
			countLabel={`${event.attendeeCount} attending`}
			distanceLabel={formatDistance(event.distanceKm)}
			extraFaces={Math.max(event.attendeeCount - faces.length, 0)}
			faces={faces}
			id={event.id}
			onOpen={onOpen}
			photo={event.photo}
			scheduleLabel={formatSchedule(event.startsAt)}
			title={event.title}
			venue={event.venue}
		/>
	);
});
