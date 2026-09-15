/**
 * The three tiers from the Subscription Plans frame. There is no plans table
 * or payment provider yet (PRODUCT-STATUS §3.13), so this is the catalogue
 * until the server owns it. Prices are in kobo-free naira, monthly.
 */

export type PlanId = "free" | "premium" | "pro";

export type PaidPlanId = Exclude<PlanId, "free">;

export type BillingCycle = "monthly" | "annual";

export type Plan = {
	id: PlanId;
	name: string;
	tagline: string;
	/** The plan details header copy. Free has no details screen. */
	description: string;
	monthlyPrice: number;
	features: string[];
};

/** Annual billing takes a fifth off the monthly price, as the frame's "Save 20%". */
export const ANNUAL_DISCOUNT = 0.2;

export const PLANS: Record<PlanId, Plan> = {
	free: {
		id: "free",
		name: "Free Basic Tier",
		tagline: "Everything you need to get started",
		description: "",
		monthlyPrice: 0,
		features: [],
	},
	premium: {
		id: "premium",
		name: "Premium Elite",
		tagline: "Best for active local explorers",
		description: "Go further with unlimited connections, priority discovery and no ads.",
		monthlyPrice: 2500,
		features: [
			"Unlimited community connections",
			"Priority listing in Discover flow",
			"Create unlimited social meetups",
			"Ad-free native experience",
		],
	},
	pro: {
		id: "pro",
		name: "Pro Creator",
		tagline: "For super hosts and communities",
		description: "Elevate your social discovery with powerful interactions and infinite reach.",
		monthlyPrice: 5000,
		features: [
			"All Premium package features",
			"Verified creator profile badge",
			"Featured profile highlight locally",
			"Dedicated priority helpdesk",
			"Advanced visitor analytics dashboard",
		],
	},
};

export const PAID_PLANS: PaidPlanId[] = ["premium", "pro"];

export function isPaidPlanId(value: unknown): value is PaidPlanId {
	return value === "premium" || value === "pro";
}

export function isBillingCycle(value: unknown): value is BillingCycle {
	return value === "monthly" || value === "annual";
}

/** What one billing period costs, before formatting. */
export function priceFor(plan: Plan, cycle: BillingCycle): number {
	if (cycle === "monthly") return plan.monthlyPrice;

	return Math.round(plan.monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT));
}

/** How much a year on annual billing saves against twelve monthly charges. */
export function annualSaving(plan: Plan): number {
	return plan.monthlyPrice * 12 - priceFor(plan, "annual");
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

/** The plan details "What's Included" list. Pro lists Premium's features after its own. */
export function includedFeatures(plan: Plan): string[] {
	if (plan.id === "pro") return [...plan.features, ...PLANS.premium.features];

	return plan.features;
}
