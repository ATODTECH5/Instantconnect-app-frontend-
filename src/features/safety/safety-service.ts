import { request } from "@/lib/api/api-client";
import {
	type ApiCircle,
	type ApiDispatchPlan,
	type ApiDispatchResult,
	circleListSchema,
	circleSchema,
	dispatchPlanSchema,
	dispatchResultSchema,
	selectedCirclesSchema,
} from "@/lib/api/safety-schema";

export function fetchCircles(): Promise<ApiCircle[]> {
	return request("/safety/circles", { schema: circleListSchema, auth: true }).then(
		(page) => page.items,
	);
}

export function createCircle(name: string): Promise<ApiCircle> {
	return request("/safety/circles", {
		method: "POST",
		body: { name },
		schema: circleSchema,
		auth: true,
	});
}

export function deleteCircle(id: string): Promise<void> {
	return request(`/safety/circles/${id}`, { method: "DELETE", auth: true });
}

export type NewMember = { name: string; email: string; phone?: string };

export function addMember(circleId: string, member: NewMember): Promise<ApiCircle> {
	return request(`/safety/circles/${circleId}/members`, {
		method: "POST",
		body: member,
		schema: circleSchema,
		auth: true,
	});
}

export function removeMember(circleId: string, memberId: string): Promise<ApiCircle> {
	return request(`/safety/circles/${circleId}/members/${memberId}`, {
		method: "DELETE",
		schema: circleSchema,
		auth: true,
	});
}

export function fetchDispatchPlan(meetupId: string): Promise<ApiDispatchPlan> {
	return request(`/safety/meetups/${meetupId}/dispatch`, {
		schema: dispatchPlanSchema,
		auth: true,
	});
}

export function selectCircles(meetupId: string, circleIds: string[]): Promise<string[]> {
	return request(`/safety/meetups/${meetupId}/circles`, {
		method: "PUT",
		body: { circleIds },
		schema: selectedCirclesSchema,
		auth: true,
	});
}

export function sendCheckIn(meetupId: string): Promise<ApiDispatchResult> {
	return request(`/safety/meetups/${meetupId}/check-in`, {
		method: "POST",
		schema: dispatchResultSchema,
		auth: true,
	});
}
