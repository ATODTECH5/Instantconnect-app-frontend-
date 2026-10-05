import { z } from "zod";

export const billingCycleSchema = z.enum(["monthly", "annual"]);

export const planSchema = z.object({
	id: z.string(),
	name: z.string(),
	tagline: z.string(),
	description: z.string(),
	features: z.array(z.string()),
	/** Kobo. */
	monthlyPriceMinor: z.number(),
	/** Kobo, for a year paid at once. */
	annualPriceMinor: z.number(),
});

export const plansSchema = z.array(planSchema);

export const mySubscriptionSchema = z.object({
	/** "free", or a plan id. */
	planId: z.string(),
	cycle: billingCycleSchema.nullable(),
	status: z.string().nullable(),
	currentPeriodEnd: z.string().nullable(),
	cancelAtPeriodEnd: z.boolean(),
	paymentsEnabled: z.boolean(),
});

export const checkoutSchema = z.object({
	authorizationUrl: z.string().min(1),
	reference: z.string().min(1),
	callbackUrl: z.string().min(1),
});

export const checkoutResultSchema = z.object({
	paymentStatus: z.enum(["pending", "success", "failed", "abandoned"]),
	failureReason: z.string().nullable(),
	subscription: mySubscriptionSchema,
});

export type ApiPlan = z.infer<typeof planSchema>;
export type ApiMySubscription = z.infer<typeof mySubscriptionSchema>;
export type ApiCheckout = z.infer<typeof checkoutSchema>;
export type ApiCheckoutResult = z.infer<typeof checkoutResultSchema>;
