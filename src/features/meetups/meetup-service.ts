import { request } from "@/lib/api/api-client";
import { type ApiMeetup, meetupSchema, openMeetupSchema } from "@/lib/api/meetup-schema";

export type MeetupVenueInput = {
	name: string;
	address?: string;
	latitude?: number;
	longitude?: number;
};

export function proposeMeetup(input: {
	conversationId: string;
	proposedTimes: string[];
	venue?: MeetupVenueInput;
}): Promise<ApiMeetup> {
	return request("/meetups", { method: "POST", body: input, schema: meetupSchema, auth: true });
}

export function fetchOpenMeetup(conversationId: string): Promise<ApiMeetup | null> {
	return request(`/meetups/open?conversationId=${conversationId}`, {
		schema: openMeetupSchema,
		auth: true,
	}).then((envelope) => envelope.meetup);
}

export function acceptMeetup(id: string, scheduledAt: string): Promise<ApiMeetup> {
	return request(`/meetups/${id}/accept`, {
		method: "POST",
		body: { scheduledAt },
		schema: meetupSchema,
		auth: true,
	});
}

export function declineMeetup(id: string): Promise<ApiMeetup> {
	return request(`/meetups/${id}/decline`, { method: "POST", schema: meetupSchema, auth: true });
}

export function counterMeetup(id: string, proposedTimes: string[]): Promise<ApiMeetup> {
	return request(`/meetups/${id}/counter`, {
		method: "POST",
		body: { proposedTimes },
		schema: meetupSchema,
		auth: true,
	});
}

export function cancelMeetup(id: string): Promise<ApiMeetup> {
	return request(`/meetups/${id}/cancel`, { method: "POST", schema: meetupSchema, auth: true });
}
