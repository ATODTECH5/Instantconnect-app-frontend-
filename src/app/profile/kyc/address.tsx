import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import { DocumentTile } from "@/components/kyc/document-tile";
import { KycStepFrame } from "@/components/kyc/kyc-step-frame";
import { FormField } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectField } from "@/components/ui/select-field";
import { Gap, Ink, Spacing, Type } from "@/constants/theme";
import { saveKycStep, useKycDraft } from "@/features/kyc/kyc-draft-store";
import { COUNTRY_OPTIONS, NIGERIA, NIGERIAN_STATE_OPTIONS } from "@/features/kyc/options";
import { useDocumentUpload } from "@/features/kyc/use-document-upload";

const addressSchema = z.object({
	addressLine: z.string().trim().min(5, "Enter your street address").max(200),
	country: z.string().min(1, "Choose your country"),
	state: z.string().trim().min(2, "Enter your state").max(80),
	city: z.string().trim().min(2, "Enter your city").max(80),
});

type AddressValues = z.infer<typeof addressSchema>;

/**
 * Proof of Address (Figma 2759:1011). The frame draws State and City as
 * selects; State is one for Nigeria (the app's market) and a text field
 * elsewhere, and City is typed, since there is no city list to select from.
 */
export default function KycAddressScreen() {
	const draft = useKycDraft().address;
	const utilityBill = useDocumentUpload("utility_bill", draft?.utilityBill ?? null);
	const [showErrors, setShowErrors] = useState(false);

	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<AddressValues>({
		defaultValues: {
			addressLine: draft?.addressLine ?? "",
			country: draft?.country ?? NIGERIA,
			state: draft?.state ?? "",
			city: draft?.city ?? "",
		},
		resolver: zodResolver(addressSchema),
		mode: "onTouched",
	});

	const country = useWatch({ control, name: "country" });
	const isNigeria = country === NIGERIA;

	const submit = handleSubmit((values) => {
		if (!utilityBill.value) {
			setShowErrors(true);
			return;
		}

		saveKycStep("address", { ...values, utilityBill: utilityBill.value });
		router.push("/profile/kyc/kin");
	});

	return (
		<KycStepFrame
			footer={
				<PrimaryButton disabled={utilityBill.uploading} label="Continue" onPress={submit} />
			}
			headerTitle="Proof of Address"
			step={2}
			subtitle="Upload an official document issued within the last 3 months verifying your residential address."
			title="Proof of Address"
		>
			<View style={styles.section}>
				<Text style={styles.sectionLabel}>
					Primary Address Details<Text style={styles.required}> *</Text>
				</Text>

				<Controller
					control={control}
					name="addressLine"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							autoCapitalize="words"
							autoComplete="street-address"
							error={errors.addressLine?.message}
							label="Address"
							maxLength={200}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="Enter address"
							returnKeyType="next"
							textContentType="fullStreetAddress"
							value={value}
						/>
					)}
				/>

				<Controller
					control={control}
					name="country"
					render={({ field: { onChange, value } }) => (
						<SelectField
							accessibilityLabel="Country"
							clearLabel={null}
							error={errors.country?.message}
							label="Country"
							onChange={(id) => {
								onChange(id ?? "");
								setValue("state", "");
							}}
							options={COUNTRY_OPTIONS}
							placeholder="Select"
							sheetTitle="Country"
							value={value || null}
						/>
					)}
				/>

				<Controller
					control={control}
					name="state"
					render={({ field: { onChange, onBlur, value } }) =>
						isNigeria ? (
							<SelectField
								accessibilityLabel="State"
								clearLabel={null}
								error={errors.state?.message}
								label="State"
								onChange={(id) => onChange(id ?? "")}
								options={NIGERIAN_STATE_OPTIONS}
								placeholder="Select"
								sheetTitle="State"
								value={value || null}
							/>
						) : (
							<FormField
								autoCapitalize="words"
								error={errors.state?.message}
								label="State"
								maxLength={80}
								onBlur={onBlur}
								onChangeText={onChange}
								placeholder="Enter state or region"
								returnKeyType="next"
								value={value}
							/>
						)
					}
				/>

				<Controller
					control={control}
					name="city"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							autoCapitalize="words"
							autoComplete="postal-address-locality"
							error={errors.city?.message}
							label="City"
							maxLength={80}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="Enter city"
							returnKeyType="done"
							textContentType="addressCity"
							value={value}
						/>
					)}
				/>
			</View>

			<View style={styles.divider} />

			<DocumentTile
				error={
					utilityBill.error ??
					(showErrors && !utilityBill.value ? "Upload a recent utility document" : undefined)
				}
				fileName={utilityBill.value?.fileName ?? null}
				hint="Power/NEPA bill, water bill, or internet statement"
				label="Supporting Utility Document"
				onPress={() => void utilityBill.pick()}
				uploading={utilityBill.uploading}
			/>
		</KycStepFrame>
	);
}

const styles = StyleSheet.create({
	section: {
		gap: Gap.section,
	},
	sectionLabel: {
		...Type.docSection,
		marginBottom: -Spacing.one,
		color: Ink.title,
	},
	required: {
		color: Ink.danger,
	},
	divider: {
		height: 1,
		backgroundColor: Ink.rowBorder,
	},
});
