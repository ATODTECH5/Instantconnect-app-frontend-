import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import { request } from "@/lib/api/api-client";
import { uploadToProvider } from "@/lib/api/direct-upload";
import {
	type ApiEventDetail,
	type ApiEventPage,
	type ApiEventVenue,
	eventDetailSchema,
	eventPageSchema,
	recentVenuesSchema,
} from "@/lib/api/event-schema";
import { uploadSignatureSchema } from "@/lib/api/upload-signature-schema";

export type EventTimeframe = "upcoming" | "past";

export type NewEvent = {
	title: string;
	description?: string;
	startsAt: string;
	endsAt?: string;
	venue: { name: string; address?: string; latitude: number; longitude: number };
	categoryId?: string;
	priceMinor: number;
	isPublic: boolean;
	coverStorageId?: string;
	inviteeIds?: string[];
};

/** Enough for the list to feel complete without paging; hosts rarely run more. */
const MY_EVENTS_PAGE = 50;

export function fetchMyEvents(when: EventTimeframe): Promise<ApiEventPage> {
	return request(`/events/mine?when=${when}&limit=${MY_EVENTS_PAGE}`, {
		schema: eventPageSchema,
		auth: true,
	});
}

export function fetchEvent(id: string): Promise<ApiEventDetail> {
	return request(`/events/${encodeURIComponent(id)}`, {
		schema: eventDetailSchema,
		auth: true,
	});
}

export function fetchRecentVenues(): Promise<ApiEventVenue[]> {
	return request("/events/recent-venues", { schema: recentVenuesSchema, auth: true });
}

/** Device to provider, like a profile photo. Returns the id the event carries. */
export async function uploadEventCover(photo: PickedPhoto): Promise<string> {
	const signature = await request("/events/cover-upload-signature", {
		method: "POST",
		schema: uploadSignatureSchema,
		auth: true,
	});

	return uploadToProvider(signature, photo);
}

export function createEvent(event: NewEvent): Promise<ApiEventDetail> {
	return request("/events", {
		method: "POST",
		body: event,
		schema: eventDetailSchema,
		auth: true,
	});
}
