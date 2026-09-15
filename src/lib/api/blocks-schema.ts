import { z } from "zod";

export const blockedUserSchema = z.object({
	id: z.string().min(1),
	fullName: z.string().min(1),
	avatarUrl: z.string().nullable(),
	blockedAt: z.string().min(1),
});

export type ApiBlockedUser = z.infer<typeof blockedUserSchema>;

export const blockedUsersSchema = z.object({
	items: z.array(blockedUserSchema),
	total: z.number().int().nonnegative(),
});
