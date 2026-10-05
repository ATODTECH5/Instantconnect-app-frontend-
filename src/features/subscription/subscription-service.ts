import { request } from "@/lib/api/api-client";
import {
	type ApiCheckout,
	type ApiCheckoutResult,
	type ApiMySubscription,
	type ApiPlan,
	checkoutResultSchema,
	checkoutSchema,
	mySubscriptionSchema,
	plansSchema,
} from "@/lib/api/subscription-schema";

import type { BillingCycle } from "./plans";

export function fetchPlans(): Promise<ApiPlan[]> {
	return request("/subscriptions/plans", { schema: plansSchema, auth: true });
}

export function fetchMySubscription(): Promise<ApiMySubscription> {
	return request("/subscriptions/me", { schema: mySubscriptionSchema, auth: true });
}

export function startCheckout(planId: string, cycle: BillingCycle): Promise<ApiCheckout> {
	return request("/subscriptions/checkout", {
		method: "POST",
		body: { planId, cycle },
		schema: checkoutSchema,
		auth: true,
	});
}

export function confirmCheckout(reference: string): Promise<ApiCheckoutResult> {
	return request(`/subscriptions/checkout/${encodeURIComponent(reference)}`, {
		schema: checkoutResultSchema,
		auth: true,
	});
}

export function cancelSubscription(): Promise<ApiMySubscription> {
	return request("/subscriptions/me/cancel", {
		method: "POST",
		schema: mySubscriptionSchema,
		auth: true,
	});
}
