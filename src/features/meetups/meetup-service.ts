import { request } from "@/lib/api/api-client";
import {
	type ApiArrivalCode,
	type ApiMeetup,
	type ApiMeetupParty,
	type ApiVerifyCode,
	arrivalCodeSchema,
	meetupPartySchema,
	meetupSchema,
	openMeetupSchema,
	verifyCodeSchema,
} from "@/lib/api/meetup-schema";

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

export function endMeetup(id: string): Promise<ApiMeetup> {
	return request(`/meetups/${id}/end`, { method: "POST", schema: meetupSchema, auth: true });
}

export function cancelMeetup(id: string): Promise<ApiMeetup> {
	return request(`/meetups/${id}/cancel`, { method: "POST", schema: meetupSchema, auth: true });
}

export function fetchMeetup(id: string): Promise<ApiMeetup> {
	return request(`/meetups/${id}`, { schema: meetupSchema, auth: true });
}

export function issueArrivalCode(id: string): Promise<ApiArrivalCode> {
	return request(`/meetups/${id}/arrival-code`, {
		method: "POST",
		schema: arrivalCodeSchema,
		auth: true,
	});
}

export function verifyArrivalCode(id: string, code: string): Promise<ApiVerifyCode> {
	return request(`/meetups/${id}/verify-code`, {
		method: "POST",
		body: { code },
		schema: verifyCodeSchema,
		auth: true,
	});
}

export function setArrival(id: string, state: "en_route" | "arrived"): Promise<ApiMeetup> {
	return request(`/meetups/${id}/arrival`, {
		method: "PATCH",
		body: { state },
		schema: meetupSchema,
		auth: true,
	});
}

export function setLocationSharing(id: string, enabled: boolean): Promise<ApiMeetup> {
	return request(`/meetups/${id}/location-sharing`, {
		method: "PATCH",
		body: { enabled },
		schema: meetupSchema,
		auth: true,
	});
}

export function reportLocation(
	id: string,
	fix: { latitude: number; longitude: number; accuracyM?: number },
): Promise<ApiMeetupParty> {
	return request(`/meetups/${id}/location`, {
		method: "POST",
		body: fix,
		schema: meetupPartySchema,
		auth: true,
	});
}
