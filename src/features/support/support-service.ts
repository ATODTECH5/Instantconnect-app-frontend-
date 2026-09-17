import { request } from "@/lib/api/api-client";
import {
	type ApiSupportMessage,
	type ApiSupportMessagePage,
	supportMessagePageSchema,
	supportMessageSchema,
} from "@/lib/api/support-schema";

export const MAX_SUPPORT_MESSAGE_LENGTH = 2000;

/** One page is the whole thread for any account that has ever written in. */
const THREAD_PAGE_SIZE = 50;

export function fetchSupportMessages(): Promise<ApiSupportMessagePage> {
	return request(`/support/messages?limit=${THREAD_PAGE_SIZE}`, {
		schema: supportMessagePageSchema,
		auth: true,
	});
}

export function sendSupportMessage(body: string): Promise<ApiSupportMessage> {
	return request("/support/messages", {
		method: "POST",
		body: { body },
		schema: supportMessageSchema,
		auth: true,
	});
}
