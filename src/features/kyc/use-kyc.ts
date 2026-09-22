import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import { profileKey } from "@/features/profile/use-profile";
import type { ApiKycDocumentKind, ApiKycOverview } from "@/lib/api/kyc-schema";
import { fetchKycOverview, type KycSubmission, submitKyc, uploadKycDocument } from "./kyc-service";

export const KYC_KEY = ["kyc"] as const;

export function useKycOverview(): UseQueryResult<ApiKycOverview> {
	return useQuery({ queryKey: KYC_KEY, queryFn: fetchKycOverview });
}

export type UploadDocumentInput = { document: ApiKycDocumentKind; photo: PickedPhoto };

export function useUploadKycDocument(): UseMutationResult<string, Error, UploadDocumentInput> {
	return useMutation({
		mutationFn: ({ document, photo }) => uploadKycDocument(document, photo),
	});
}

/** The profile is invalidated too, since its `kycStatus` drives the menu chip and the badge. */
export function useSubmitKyc(): UseMutationResult<ApiKycOverview, Error, KycSubmission> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: submitKyc,
		onSuccess: (overview) => {
			client.setQueryData(KYC_KEY, overview);
			void client.invalidateQueries({ queryKey: profileKey });
		},
	});
}
