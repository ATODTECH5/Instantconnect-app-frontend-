import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import CheckCircleIcon from "@/assets/kyc/check-circle.svg";
import { KycStepFrame } from "@/components/kyc/kyc-step-frame";
import { SelfieFrame } from "@/components/kyc/selfie-frame";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import { clearKycDraft, saveKycStep, useKycDraft } from "@/features/kyc/kyc-draft-store";
import { useSubmitKyc, useUploadKycDocument } from "@/features/kyc/use-kyc";
import { useTakeSelfie } from "@/features/kyc/use-take-selfie";
import { describeError } from "@/lib/api/api-error";

const TIPS = [
	"Ensure you are in a bright, well-lit room",
	"Position your face inside the guiding oval frame",
	"Remove glasses, masks, or hats before starting",
];
const TIP_ICON = 16;

/**
 * Facial Recognition (Figma 2761:1142). The selfie uploads as soon as it is
 * taken; Submit Details sends the whole draft, and on success dismisses to
 * the hub, which now shows the submitted frame.
 */
export default function KycSelfieScreen() {
	const draft = useKycDraft();
	const takeSelfie = useTakeSelfie();
	const upload = useUploadKycDocument();
	const submit = useSubmitKyc();
	const [selfie, setSelfie] = useState(draft.selfie);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const capture = useCallback(async () => {
		const photo = await takeSelfie();

		if (!photo) return;

		setUploadError(null);

		try {
			const storageId = await upload.mutateAsync({ document: "selfie", photo });

			setSelfie({ storageId, uri: photo.uri });
		} catch (cause) {
			setUploadError(describeError(cause));
		}
	}, [takeSelfie, upload]);

	const send = () => {
		const { id, address, kin } = draft;

		if (!selfie || !id || !address || !kin) return;

		saveKycStep("selfie", selfie);
		submit.mutate(
			{
				nationalIdStorageId: id.nationalId.storageId,
				additionalIdKind: id.additionalIdKind,
				additionalIdStorageId: id.additionalId.storageId,
				addressLine: address.addressLine,
				country: address.country,
				state: address.state,
				city: address.city,
				utilityBillStorageId: address.utilityBill.storageId,
				...kin,
				selfieStorageId: selfie.storageId,
			},
			{
				onSuccess: () => {
					clearKycDraft();
					router.dismissTo("/profile/kyc");
				},
			},
		);
	};

	const stepsMissing = !draft.id || !draft.address || !draft.kin;

	if (stepsMissing) {
		return (
			<KycStepFrame
				footer={
					<PrimaryButton
						label="Start over"
						onPress={() => router.dismissTo("/profile/kyc")}
					/>
				}
				headerTitle="Facial Recognition"
				step={4}
				subtitle="Our security engine matches a live selfie against your provided photo ID for authentication verification."
				title="Facial Recognition"
			>
				<StateMessage
					isError
					message="The earlier steps are missing. Please go back and complete them first."
				/>
			</KycStepFrame>
		);
	}

	const busy = upload.isPending || submit.isPending;

	return (
		<KycStepFrame
			footer={
				<View style={styles.actions}>
					<PrimaryButton
						disabled={busy}
						label={selfie ? "Submit Details" : "Take Selfie"}
						loading={submit.isPending}
						onPress={selfie ? send : () => void capture()}
					/>

					{selfie ? (
						<Pressable
							accessibilityLabel="Retake selfie"
							accessibilityRole="button"
							accessibilityState={{ disabled: busy }}
							disabled={busy}
							onPress={() => void capture()}
							style={({ pressed }) => [styles.retake, pressed && styles.pressed]}
						>
							<Text style={styles.retakeLabel}>Retake</Text>
						</Pressable>
					) : null}
				</View>
			}
			headerTitle="Facial Recognition"
			step={4}
			subtitle="Our security engine matches a live selfie against your provided photo ID for authentication verification."
			title="Facial Recognition"
		>
			{submit.isError ? <FormErrorBanner message={describeError(submit.error)} /> : null}
			{uploadError ? <FormErrorBanner message={uploadError} /> : null}

			<Pressable
				accessibilityHint="Opens the camera"
				accessibilityLabel={selfie ? "Retake your selfie" : "Take your selfie"}
				accessibilityRole="button"
				accessibilityState={{ busy: upload.isPending, disabled: busy }}
				disabled={busy}
				onPress={() => void capture()}
			>
				<SelfieFrame uri={selfie?.uri ?? null} />
			</Pressable>

			<View style={styles.tips}>
				<Text style={styles.tipsTitle}>Tips for a successful scan:</Text>

				{TIPS.map((tip) => (
					<View key={tip} style={styles.tip}>
						<CheckCircleIcon color={Ink.success} height={TIP_ICON} width={TIP_ICON} />
						<Text style={styles.tipLabel}>{tip}</Text>
					</View>
				))}
			</View>
		</KycStepFrame>
	);
}

const styles = StyleSheet.create({
	tips: {
		gap: Gap.snug,
		padding: Spacing.three,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.surface,
	},
	tipsTitle: {
		...Type.docSection,
		marginBottom: Spacing.half,
		color: Ink.title,
	},
	tip: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
	tipLabel: {
		...Type.profileMeta,
		flex: 1,
		color: Ink.muted,
	},
	actions: {
		gap: Spacing.one,
	},
	retake: {
		minHeight: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
	},
	retakeLabel: {
		...Type.action,
		color: Brand.orange,
	},
	pressed: {
		opacity: 0.7,
	},
});
