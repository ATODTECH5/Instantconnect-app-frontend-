import { request } from "@/lib/api/api-client";
import {
	connectionPageSchema,
	connectionSchema,
	discoveryPageSchema,
	personProfileSchema,
	type ApiConnection,
	type ApiConnectionPage,
	type ApiDiscoveryPage,
	type ApiPersonProfile,
} from "@/lib/api/discovery-schema";

export type NearbyQuery = {
	categoryId?: string;
	radiusKm?: number;
	verifiedOnly?: boolean;
	onlineOnly?: boolean;
	limit?: number;
	offset?: number;
};

function toSearch(query: NearbyQuery): string {
	const params = new URLSearchParams();

	if (query.categoryId) params.set("categoryId", query.categoryId);
	if (query.radiusKm !== undefined) params.set("radiusKm", String(query.radiusKm));
	if (query.verifiedOnly) params.set("verifiedOnly", "true");
	if (query.onlineOnly) params.set("onlineOnly", "true");
	if (query.limit !== undefined) params.set("limit", String(query.limit));
	if (query.offset !== undefined) params.set("offset", String(query.offset));

	const search = params.toString();

	return search ? `?${search}` : "";
}

export function fetchNearbyPeople(query: NearbyQuery = {}): Promise<ApiDiscoveryPage> {
	return request(`/discovery/people${toSearch(query)}`, {
		schema: discoveryPageSchema,
		auth: true,
	});
}

export function fetchPersonProfile(id: string): Promise<ApiPersonProfile> {
	return request(`/discovery/people/${id}`, {
		schema: personProfileSchema,
		auth: true,
	});
}

export function sendConnectionRequest(addresseeId: string): Promise<ApiConnection> {
	return request("/connections", {
		method: "POST",
		body: { addresseeId },
		schema: connectionSchema,
		auth: true,
	});
}

export function respondToConnection(
	id: string,
	status: "accepted" | "declined",
): Promise<ApiConnection> {
	return request(`/connections/${id}`, {
		method: "PATCH",
		body: { status },
		schema: connectionSchema,
		auth: true,
	});
}

export function fetchConnections(
	status?: "pending" | "accepted" | "declined",
): Promise<ApiConnectionPage> {
	return request(`/connections${status ? `?status=${status}` : ""}`, {
		schema: connectionPageSchema,
		auth: true,
	});
}
