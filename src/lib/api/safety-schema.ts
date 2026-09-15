import { z } from "zod";

export const circleMemberSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	phone: z.string().nullable(),
});

export const circleSchema = z.object({
	id: z.string(),
	name: z.string(),
	members: z.array(circleMemberSchema),
	createdAt: z.string(),
});

export const circleListSchema = z.object({ items: z.array(circleSchema) });

export const selectedCirclesSchema = z.array(z.string());

export const dispatchPlanSchema = z.object({
	circleIds: z.array(z.string()),
	/** The check-in sentence, exactly as the email will lead. */
	preview: z.string(),
});

export const dispatchResultSchema = z.object({
	sent: z.number(),
	alreadySent: z.number(),
	failed: z.number(),
});

export type ApiCircle = z.infer<typeof circleSchema>;
export type ApiCircleMember = z.infer<typeof circleMemberSchema>;
export type ApiDispatchResult = z.infer<typeof dispatchResultSchema>;
export type ApiDispatchPlan = z.infer<typeof dispatchPlanSchema>;
