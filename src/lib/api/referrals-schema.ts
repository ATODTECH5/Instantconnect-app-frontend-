import { z } from "zod";

import { pageInfoSchema } from "@/lib/api/discovery-schema";

export const referralStatusSchema = z.enum(["pending", "joined"]);

export const referralSchema = z.object({
	id: z.string().min(1),
	fullName: z.string().min(1),
	avatarUrl: z.string().nullable(),
	status: referralStatusSchema,
	invitedAt: z.string().min(1),
	joinedAt: z.string().nullable(),
});

export const referralsSchema = z.object({
	code: z.string().min(1),
	joinedCount: z.number().int().nonnegative(),
	pendingCount: z.number().int().nonnegative(),
	goal: z.number().int().positive(),
	items: z.array(referralSchema),
	page: pageInfoSchema,
});

export type ApiReferralStatus = z.infer<typeof referralStatusSchema>;
export type ApiReferral = z.infer<typeof referralSchema>;
export type ApiReferrals = z.infer<typeof referralsSchema>;
