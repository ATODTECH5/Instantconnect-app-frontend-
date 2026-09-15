import { useSyncExternalStore } from "react";

import type { PaymentReceipt } from "@/features/subscription/mock-payment";
import type { BillingCycle, PlanId } from "@/features/subscription/plans";

/**
 * The account's current plan. In memory only, so a relaunch returns everyone
 * to the free tier; a `subscriptions` table replaces this once a payment
 * provider is chosen. Shaped like the session store so swapping in a query
 * later touches only this file.
 */
export type Subscription = {
	planId: PlanId;
	cycle: BillingCycle | null;
	nextBillingAt: string | null;
};

const FREE: Subscription = { planId: "free", cycle: null, nextBillingAt: null };

let current: Subscription = FREE;
const listeners = new Set<() => void>();

function publish(): void {
	for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

function getSnapshot(): Subscription {
	return current;
}

export function activateSubscription(receipt: PaymentReceipt): void {
	current = {
		planId: receipt.planId,
		cycle: receipt.cycle,
		nextBillingAt: receipt.nextBillingAt,
	};
	publish();
}

export function useSubscription(): Subscription {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
