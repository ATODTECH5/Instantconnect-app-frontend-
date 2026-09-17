import { z } from "zod";

import { pageInfoSchema } from "@/lib/api/discovery-schema";

export const supportMessageSchema = z.object({
	id: z.string().min(1),
	direction: z.enum(["inbound", "outbound"]),
	agentName: z.string().nullable(),
	subject: z.string().nullable(),
	body: z.string(),
	createdAt: z.string().min(1),
});

export const supportMessagePageSchema = z.object({
	items: z.array(supportMessageSchema),
	page: pageInfoSchema,
});

export type ApiSupportMessage = z.infer<typeof supportMessageSchema>;
export type ApiSupportMessagePage = z.infer<typeof supportMessagePageSchema>;
