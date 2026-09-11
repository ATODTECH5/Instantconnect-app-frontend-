import { z } from "zod";

/**
 * Mirrors `UploadSignatureResponseDto`. Shared by profile photos and chat
 * images: both upload device to provider, so the signature has one shape.
 */
export const uploadSignatureSchema = z.object({
	uploadUrl: z.string().min(1),
	apiKey: z.string().min(1),
	timestamp: z.number(),
	signature: z.string().min(1),
	storageId: z.string().min(1),
	transformation: z.string().min(1),
});

export type ApiUploadSignature = z.infer<typeof uploadSignatureSchema>;
