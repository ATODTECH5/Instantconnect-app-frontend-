import type { ApiPlan } from "@/lib/api/subscription-schema";

export type BillingCycle = "monthly" | "annual";

/** A plan in naira, as every screen shows it. The server keeps kobo. */
export type Plan = {
	id: string;
	name: string;
	tagline: string;
	description: string;
	features: string[];
	monthlyPrice: number;
	annualPrice: number;
};

/** Free is not a server plan: it is having no live subscription. */
export const FREE_PLAN: Plan = {
	id: "free",
	name: "Free Basic Tier",
	tagline: "Everything you need to get started",
	description: "",
	features: [],
	monthlyPrice: 0,
	annualPrice: 0,
};

export function toPlan(plan: ApiPlan): Plan {
	return {
		id: plan.id,
		name: plan.name,
		tagline: plan.tagline,
		description: plan.description,
		features: plan.features,
		monthlyPrice: plan.monthlyPriceMinor / 100,
		annualPrice: plan.annualPriceMinor / 100,
	};
}

export function isBillingCycle(value: unknown): value is BillingCycle {
	return value === "monthly" || value === "annual";
}

/** What one billing period costs. */
export function priceFor(plan: Plan, cycle: BillingCycle): number {
	return cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
}

/** How much a year on annual billing saves against twelve monthly charges. */
export function annualSaving(plan: Plan): number {
	return Math.max(0, plan.monthlyPrice * 12 - plan.annualPrice);
}

/** The "Save 20%" on the billing toggle, from the plan's own prices. */
export function annualDiscountPercent(plan: Plan): number {
	if (plan.monthlyPrice <= 0) return 0;

	return Math.round((annualSaving(plan) / (plan.monthlyPrice * 12)) * 100);
}

/**
 * The frames write "₦2,500" and "₦5,000.00". `Intl` on Hermes handles the
 * grouping; the naira sign is added by hand so no locale swaps it for "NGN".
 */
export function formatNaira(amount: number, { decimals = 0 }: { decimals?: number } = {}): string {
	const grouped = amount.toLocaleString("en-NG", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});

	return `₦${grouped}`;
}

export function cycleSuffix(cycle: BillingCycle): string {
	return cycle === "monthly" ? "/month" : "/year";
}

export function cycleSuffixShort(cycle: BillingCycle): string {
	return cycle === "monthly" ? "/mo" : "/yr";
}
