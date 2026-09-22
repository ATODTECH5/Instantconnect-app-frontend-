import { router } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import GlobeIcon from "@/assets/kyc/globe.svg";
import IdCardIcon from "@/assets/kyc/id-card.svg";
import { DocumentTile } from "@/components/kyc/document-tile";
import { IdOptionRow } from "@/components/kyc/id-option-row";
import { KycStepFrame } from "@/components/kyc/kyc-step-frame";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Ink, Spacing, Type } from "@/constants/theme";
import { saveKycStep, useKycDraft } from "@/features/kyc/kyc-draft-store";
import { ADDITIONAL_ID_OPTIONS } from "@/features/kyc/options";
import { useDocumentUpload } from "@/features/kyc/use-document-upload";
import type { ApiKycAdditionalIdKind } from "@/lib/api/kyc-schema";

const OPTION_ICONS = { passport: GlobeIcon, drivers_license: IdCardIcon } as const;

/**
 * ID Verification (Figma 2759:850). Both scans are uploaded as they are
 * chosen; Continue only records them in the draft. Switching the additional
 * ID kind drops the scan already uploaded for the other kind, since the
 * server checks the id was signed for that document.
 */
export default function KycIdScreen() {
	const draft = useKycDraft().id;
	const [kind, setKind] = useState<ApiKycAdditionalIdKind>(draft?.additionalIdKind ?? "passport");
	const nationalId = useDocumentUpload("national_id", draft?.nationalId ?? null);
	const additionalId = useDocumentUpload(kind, draft?.additionalId ?? null);
	const [showErrors, setShowErrors] = useState(false);

	const option = ADDITIONAL_ID_OPTIONS.find((candidate) => candidate.id === kind);

	const choose = useCallback(
		(next: ApiKycAdditionalIdKind) => {
			if (next === kind) return;

			setKind(next);
			additionalId.reset();
		},
		[additionalId, kind],
	);

	const submit = () => {
		if (!nationalId.value || !additionalId.value) {
			setShowErrors(true);
			return;
		}

		saveKycStep("id", {
			nationalId: nationalId.value,
			additionalIdKind: kind,
			additionalId: additionalId.value,
		});
		router.push("/profile/kyc/address");
	};

	const busy = nationalId.uploading || additionalId.uploading;

	return (
		<KycStepFrame
			footer={<PrimaryButton disabled={busy} label="Continue" onPress={submit} />}
			headerTitle="ID Verification"
			step={1}
			subtitle="Please provide high-quality scans of your primary and secondary identification documents."
			title="ID Verification"
		>
			<DocumentTile
				error={
					nationalId.error ??
					(showErrors && !nationalId.value ? "Upload your national ID card" : undefined)
				}
				fileName={nationalId.value?.fileName ?? null}
				hint="Front and back on one clear photo"
				label="National ID Card"
				onPress={() => void nationalId.pick()}
				uploading={nationalId.uploading}
			/>

			<View style={styles.divider} />

			<View style={styles.options}>
				<Text style={styles.optionsLabel}>Choose one additional ID</Text>

				{ADDITIONAL_ID_OPTIONS.map((candidate) => (
					<IdOptionRow
						description={candidate.description}
						Icon={OPTION_ICONS[candidate.id]}
						key={candidate.id}
						label={candidate.label}
						onPress={() => choose(candidate.id)}
						selected={candidate.id === kind}
					/>
				))}
			</View>

			<DocumentTile
				error={
					additionalId.error ??
					(showErrors && !additionalId.value ? `Upload your ${option?.label ?? "document"}` : undefined)
				}
				fileName={additionalId.value?.fileName ?? null}
				hint={option?.uploadHint ?? ""}
				label={kind === "passport" ? "Passport Document Scan" : "Driver's License Scan"}
				onPress={() => void additionalId.pick()}
				uploading={additionalId.uploading}
			/>
		</KycStepFrame>
	);
}

const styles = StyleSheet.create({
	divider: {
		height: 1,
		backgroundColor: Ink.rowBorder,
	},
	options: {
		gap: Spacing.two + Spacing.half,
	},
	optionsLabel: {
		...Type.docSection,
		marginBottom: Spacing.half,
		color: Ink.title,
	},
});
