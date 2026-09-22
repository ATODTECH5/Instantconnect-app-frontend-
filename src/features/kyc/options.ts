import type { SelectOption } from "@/components/ui/select-field";
import type { ApiKinRelationship, ApiKycAdditionalIdKind } from "@/lib/api/kyc-schema";

export const KYC_STEP_COUNT = 4;

export const ADDITIONAL_ID_OPTIONS: {
	id: ApiKycAdditionalIdKind;
	label: string;
	description: string;
	uploadHint: string;
}[] = [
	{
		id: "passport",
		label: "International Passport",
		description: "Bio-data page with clear photo and signature",
		uploadHint: "Upload a high-quality scan of your passport's main page",
	},
	{
		id: "drivers_license",
		label: "Driver's License",
		description: "Valid state-issued driving permit",
		uploadHint: "Upload a high-quality scan of the front of your licence",
	},
];

export const RELATIONSHIP_OPTIONS: { id: ApiKinRelationship; label: string }[] = [
	{ id: "parent", label: "Parent" },
	{ id: "sibling", label: "Sibling" },
	{ id: "spouse", label: "Spouse" },
	{ id: "child", label: "Child" },
	{ id: "guardian", label: "Guardian" },
	{ id: "relative", label: "Other relative" },
];

export const COUNTRY_OPTIONS: SelectOption[] = [
	"Nigeria",
	"Ghana",
	"Kenya",
	"South Africa",
	"United Kingdom",
	"United States",
].map((name) => ({ id: name, label: name }));

/** The 36 states plus the FCT. Used only when the country is Nigeria. */
export const NIGERIAN_STATE_OPTIONS: SelectOption[] = [
	"Abia",
	"Adamawa",
	"Akwa Ibom",
	"Anambra",
	"Bauchi",
	"Bayelsa",
	"Benue",
	"Borno",
	"Cross River",
	"Delta",
	"Ebonyi",
	"Edo",
	"Ekiti",
	"Enugu",
	"FCT Abuja",
	"Gombe",
	"Imo",
	"Jigawa",
	"Kaduna",
	"Kano",
	"Katsina",
	"Kebbi",
	"Kogi",
	"Kwara",
	"Lagos",
	"Nasarawa",
	"Niger",
	"Ogun",
	"Ondo",
	"Osun",
	"Oyo",
	"Plateau",
	"Rivers",
	"Sokoto",
	"Taraba",
	"Yobe",
	"Zamfara",
].map((name) => ({ id: name, label: name }));

export const NIGERIA = "Nigeria";

/** Matches the server's `kinPhone` rule. */
export const PHONE = /^\+?[0-9]{7,15}$/;
