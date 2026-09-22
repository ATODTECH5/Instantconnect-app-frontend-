import type { ImagePickerOptions } from "expo-image-picker";
import { useCallback, useState } from "react";

import type { UploadedDocument } from "@/features/kyc/kyc-draft-store";
import { useUploadKycDocument } from "@/features/kyc/use-kyc";
import { usePickPhoto } from "@/features/profile/use-pick-photo";
import { describeError } from "@/lib/api/api-error";
import type { ApiKycDocumentKind } from "@/lib/api/kyc-schema";

/** A document keeps its full frame: cropping an ID card would cut its edges off. */
const DOCUMENT_OPTIONS: ImagePickerOptions = {
	mediaTypes: ["images"],
	allowsEditing: false,
	quality: 0.9,
};

export type DocumentUpload = {
	value: UploadedDocument | null;
	uploading: boolean;
	error: string | null;
	pick: () => Promise<void>;
	reset: () => void;
};

/**
 * Pick, then upload straight away, so a step's Continue only has to check
 * that a storage id exists. Starts from whatever the draft already holds, so
 * coming back to a step shows the file that was chosen before.
 */
export function useDocumentUpload(
	document: ApiKycDocumentKind,
	initial: UploadedDocument | null,
): DocumentUpload {
	const pickPhoto = usePickPhoto(DOCUMENT_OPTIONS);
	const upload = useUploadKycDocument();
	const [value, setValue] = useState<UploadedDocument | null>(initial);
	const [error, setError] = useState<string | null>(null);

	const pick = useCallback(async () => {
		const photo = await pickPhoto();

		if (!photo) return;

		setError(null);

		try {
			const storageId = await upload.mutateAsync({ document, photo });

			setValue({ storageId, fileName: photo.fileName });
		} catch (cause) {
			setError(describeError(cause));
		}
	}, [document, pickPhoto, upload]);

	const reset = useCallback(() => {
		setValue(null);
		setError(null);
	}, []);

	return { value, uploading: upload.isPending, error, pick, reset };
}
