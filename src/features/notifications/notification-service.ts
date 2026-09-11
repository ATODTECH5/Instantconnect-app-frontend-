import { request } from "@/lib/api/api-client";
import {
	notificationPageSchema,
	notificationSchema,
	type ApiNotification,
	type ApiNotificationPage,
} from "@/lib/api/notification-schema";

export function fetchNotifications(
	query: { limit?: number; offset?: number } = {},
): Promise<ApiNotificationPage> {
	const params = new URLSearchParams();

	if (query.limit !== undefined) params.set("limit", String(query.limit));
	if (query.offset !== undefined) params.set("offset", String(query.offset));

	const search = params.toString();

	return request(`/notifications${search ? `?${search}` : ""}`, {
		schema: notificationPageSchema,
		auth: true,
	});
}

export function markNotificationRead(id: string): Promise<ApiNotification> {
	return request(`/notifications/${id}/read`, {
		method: "PATCH",
		schema: notificationSchema,
		auth: true,
	});
}

export function markAllNotificationsRead(): Promise<void> {
	return request("/notifications/read", { method: "PATCH", auth: true });
}
