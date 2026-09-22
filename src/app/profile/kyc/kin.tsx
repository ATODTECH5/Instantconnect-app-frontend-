import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View, type TextInput } from "react-native";
import { z } from "zod";

import { KycStepFrame } from "@/components/kyc/kyc-step-frame";
import { FormField } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectField } from "@/components/ui/select-field";
import { Gap, Ink, Spacing, Type } from "@/constants/theme";
import { saveKycStep, useKycDraft } from "@/features/kyc/kyc-draft-store";
import { PHONE, RELATIONSHIP_OPTIONS } from "@/features/kyc/options";
import { kinRelationshipSchema } from "@/lib/api/kyc-schema";

const kinSchema = z.object({
	kinName: z.string().trim().min(2, "Enter their full name").max(80),
	kinRelationship: kinRelationshipSchema.nullable().refine((value) => value !== null, {
		message: "Choose how they are related to you",
	}),
	kinPhone: z
		.string()
		.transform((value) => value.replace(/[\s-]/g, ""))
		.refine((value) => PHONE.test(value), "Enter a valid phone number"),
	kinEmail: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
	kinAddress: z.string().trim().min(5, "Enter their residential address").max(200),
});

type KinValues = z.input<typeof kinSchema>;
type KinInput = z.output<typeof kinSchema>;

/** Next of Kin (Figma 2761:733). */
export default function KycKinScreen() {
	const draft = useKycDraft().kin;
	const phoneRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const addressRef = useRef<TextInput>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<KinValues, unknown, KinInput>({
		defaultValues: {
			kinName: draft?.kinName ?? "",
			kinRelationship: draft?.kinRelationship ?? null,
			kinPhone: draft?.kinPhone ?? "",
			kinEmail: draft?.kinEmail ?? "",
			kinAddress: draft?.kinAddress ?? "",
		},
		resolver: zodResolver(kinSchema),
		mode: "onTouched",
	});

	const submit = handleSubmit((values: KinInput) => {
		if (!values.kinRelationship) return;

		saveKycStep("kin", { ...values, kinRelationship: values.kinRelationship });
		router.push("/profile/kyc/selfie");
	});

	return (
		<KycStepFrame
			footer={<PrimaryButton label="Continue" onPress={submit} />}
			headerTitle="Next of Kin"
			step={3}
			subtitle="Add trusted contact information of your immediate relative for security and account backup."
			title="Next of Kin Details"
		>
			<View style={styles.section}>
				<Text style={styles.sectionLabel}>
					Ensure to input correct details<Text style={styles.required}> *</Text>
				</Text>

				<Controller
					control={control}
					name="kinName"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							autoCapitalize="words"
							autoComplete="name"
							error={errors.kinName?.message}
							label="Name"
							maxLength={80}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="Lawal Halima"
							returnKeyType="next"
							textContentType="name"
							value={value}
						/>
					)}
				/>

				<Controller
					control={control}
					name="kinRelationship"
					render={({ field: { onChange, value } }) => (
						<SelectField
							accessibilityLabel="Relationship"
							clearLabel={null}
							error={errors.kinRelationship?.message}
							label="Relationship"
							onChange={onChange}
							options={RELATIONSHIP_OPTIONS}
							placeholder="Select"
							sheetTitle="Relationship"
							value={value}
						/>
					)}
				/>

				<Controller
					control={control}
					name="kinPhone"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							autoComplete="tel"
							error={errors.kinPhone?.message}
							keyboardType="phone-pad"
							label="Phone Number"
							maxLength={18}
							onBlur={onBlur}
							onChangeText={onChange}
							onSubmitEditing={() => emailRef.current?.focus()}
							placeholder="+234"
							ref={phoneRef}
							returnKeyType="next"
							textContentType="telephoneNumber"
							value={value}
						/>
					)}
				/>

				<Controller
					control={control}
					name="kinEmail"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							autoCapitalize="none"
							autoComplete="email"
							error={errors.kinEmail?.message}
							keyboardType="email-address"
							label="Email Address"
							maxLength={255}
							onBlur={onBlur}
							onChangeText={onChange}
							onSubmitEditing={() => addressRef.current?.focus()}
							placeholder="Enter email"
							ref={emailRef}
							returnKeyType="next"
							textContentType="emailAddress"
							value={value}
						/>
					)}
				/>

				<Controller
					control={control}
					name="kinAddress"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							autoCapitalize="words"
							autoComplete="street-address"
							error={errors.kinAddress?.message}
							label="Residential Address"
							maxLength={200}
							onBlur={onBlur}
							onChangeText={onChange}
							onSubmitEditing={submit}
							placeholder="Enter address"
							ref={addressRef}
							returnKeyType="done"
							textContentType="fullStreetAddress"
							value={value}
						/>
					)}
				/>
			</View>
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
});
