import { request } from "@/lib/api/api-client";
import {
	type ApiReferral,
	type ApiReferrals,
	referralSchema,
	referralsSchema,
} from "@/lib/api/referrals-schema";

/** The screen shows the whole history; one page of fifty covers any real account. */
const HISTORY_PAGE_SIZE = 50;

export function fetchReferrals(): Promise<ApiReferrals> {
	return request(`/referrals?limit=${HISTORY_PAGE_SIZE}`, {
		schema: referralsSchema,
		auth: true,
	});
}

export function fetchReferral(id: string): Promise<ApiReferral> {
	return request(`/referrals/${id}`, { schema: referralSchema, auth: true });
}
