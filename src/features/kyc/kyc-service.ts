import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import { request } from "@/lib/api/api-client";
import { uploadToProvider } from "@/lib/api/direct-upload";
import {
	kycOverviewSchema,
	type ApiKinRelationship,
	type ApiKycAdditionalIdKind,
	type ApiKycDocumentKind,
	type ApiKycOverview,
} from "@/lib/api/kyc-schema";
import { uploadSignatureSchema } from "@/lib/api/upload-signature-schema";

export type KycSubmission = {
	nationalIdStorageId: string;
	additionalIdKind: ApiKycAdditionalIdKind;
	additionalIdStorageId: string;
	addressLine: string;
	country: string;
	state: string;
	city: string;
	utilityBillStorageId: string;
	kinName: string;
	kinRelationship: ApiKinRelationship;
	kinPhone: string;
	kinEmail: string;
	kinAddress: string;
	selfieStorageId: string;
};

export function fetchKycOverview(): Promise<ApiKycOverview> {
	return request("/kyc", { schema: kycOverviewSchema, auth: true });
}

/**
 * Device to provider, like a profile photo, but the signature marks the file
 * authenticated so no plain URL can ever serve it. Returns the storage id the
 * submission carries.
 */
export async function uploadKycDocument(
	document: ApiKycDocumentKind,
	photo: PickedPhoto,
): Promise<string> {
	const signature = await request("/kyc/upload-signature", {
		method: "POST",
		body: { document },
		schema: uploadSignatureSchema,
		auth: true,
	});

	return uploadToProvider(signature, photo);
}

export function submitKyc(submission: KycSubmission): Promise<ApiKycOverview> {
	return request("/kyc/submissions", {
		method: "POST",
		body: submission,
		schema: kycOverviewSchema,
		auth: true,
	});
}
