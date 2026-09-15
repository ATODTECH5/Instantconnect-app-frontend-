import { request } from "@/lib/api/api-client";
import { type ApiBlockedUser, blockedUsersSchema } from "@/lib/api/blocks-schema";

export function fetchBlockedUsers(): Promise<ApiBlockedUser[]> {
	return request("/blocks", { schema: blockedUsersSchema, auth: true }).then(
		(page) => page.items,
	);
}

export function blockUser(userId: string): Promise<void> {
	return request("/blocks", { method: "POST", body: { userId }, auth: true });
}

export function unblockUser(userId: string): Promise<void> {
	return request(`/blocks/${userId}`, { method: "DELETE", auth: true });
}
