import { z } from "zod";

export const kycStatusSchema = z.enum(["none", "pending", "verified", "rejected"]);

export const kycSubmissionStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const kycDocumentKindSchema = z.enum([
	"national_id",
	"passport",
	"drivers_license",
	"utility_bill",
	"selfie",
]);

export const kycAdditionalIdKindSchema = z.enum(["passport", "drivers_license"]);

export const kinRelationshipSchema = z.enum([
	"parent",
	"sibling",
	"spouse",
	"child",
	"guardian",
	"relative",
]);

export const kycSubmissionSummarySchema = z.object({
	id: z.string().min(1),
	status: kycSubmissionStatusSchema,
	submittedAt: z.string().min(1),
	reviewedAt: z.string().nullable(),
	rejectionReason: z.string().nullable(),
});

/** Mirrors `KycOverviewDto`. Documents never come back; only the decision does. */
export const kycOverviewSchema = z.object({
	status: kycStatusSchema,
	submission: kycSubmissionSummarySchema.nullable(),
});

export type ApiKycStatus = z.infer<typeof kycStatusSchema>;
export type ApiKycDocumentKind = z.infer<typeof kycDocumentKindSchema>;
export type ApiKycAdditionalIdKind = z.infer<typeof kycAdditionalIdKindSchema>;
export type ApiKinRelationship = z.infer<typeof kinRelationshipSchema>;
export type ApiKycOverview = z.infer<typeof kycOverviewSchema>;
