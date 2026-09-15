import { request } from "@/lib/api/api-client";
import {
	type ApiCodeSent,
	type ApiNotificationPreferences,
	codeSentSchema,
	type DeletionReason,
	notificationPreferencesSchema,
} from "@/lib/api/settings-schema";
import { type ApiUser, userSchema } from "@/lib/api/user-schema";

export type ContactChange = "email" | "phone";

/** Starts a change; the server mails a code and answers where it went. */
export function requestContactChange(kind: ContactChange, value: string): Promise<ApiCodeSent> {
	return request(`/settings/${kind}/change`, {
		method: "POST",
		body: { [kind]: value },
		schema: codeSentSchema,
		auth: true,
	});
}

export function confirmContactChange(kind: ContactChange, code: string): Promise<ApiUser> {
	return request(`/settings/${kind}/confirm`, {
		method: "POST",
		body: { code },
		schema: userSchema,
		auth: true,
	});
}

export function changePassword(currentPassword: string, password: string): Promise<void> {
	return request("/settings/password", {
		method: "PUT",
		body: { currentPassword, password },
		auth: true,
	});
}

export function updateSecurity(changes: {
	biometricsEnabled?: boolean;
	twoFactorEnabled?: boolean;
}): Promise<ApiUser> {
	return request("/users/me/security", {
		method: "PATCH",
		body: changes,
		schema: userSchema,
		auth: true,
	});
}

export function fetchNotificationPreferences(): Promise<ApiNotificationPreferences> {
	return request("/settings/notifications", {
		schema: notificationPreferencesSchema,
		auth: true,
	});
}

export function updateNotificationPreferences(
	changes: Partial<ApiNotificationPreferences>,
): Promise<ApiNotificationPreferences> {
	return request("/settings/notifications", {
		method: "PATCH",
		body: changes,
		schema: notificationPreferencesSchema,
		auth: true,
	});
}

export function requestAccountDeletion(
	reason: DeletionReason,
	details: string | null,
): Promise<ApiCodeSent> {
	return request("/settings/account/delete", {
		method: "POST",
		body: details ? { reason, details } : { reason },
		schema: codeSentSchema,
		auth: true,
	});
}

export function confirmAccountDeletion(code: string): Promise<void> {
	return request("/settings/account/delete/confirm", {
		method: "POST",
		body: { code },
		auth: true,
	});
}
