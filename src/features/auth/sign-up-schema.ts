import { z } from "zod";

/** Local 0XXXXXXXXXX or international +234XXXXXXXXXX, spaces and dashes allowed. */
const NIGERIAN_PHONE = /^(?:0|\+?234)(?:7[01]|8[01]|9[01])\d{8}$/;

const stripSeparators = (value: string) => value.replace(/[\s()-]/g, "");

export const signUpSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(2, "Enter your full name")
		.max(80, "Name is too long")
		.regex(/^[\p{L}][\p{L}'\-. ]*$/u, "Use letters, spaces, hyphens and apostrophes only"),
	email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
	phone: z
		.string()
		.transform(stripSeparators)
		.pipe(z.string().regex(NIGERIAN_PHONE, "Enter a valid Nigerian phone number")),
	password: z
		.string()
		.min(8, "Use at least 8 characters")
		.max(72, "Password is too long")
		.regex(/[a-z]/, "Include a lowercase letter")
		.regex(/[A-Z]/, "Include an uppercase letter")
		.regex(/\d/, "Include a number"),
	termsAccepted: z.boolean().refine((accepted) => accepted, "Accept the terms to continue"),
});

export type SignUpValues = z.input<typeof signUpSchema>;
export type SignUpInput = z.output<typeof signUpSchema>;

/** Normalises either accepted phone format to E.164 for the API. */
export function toE164(phone: string) {
	const digits = stripSeparators(phone).replace(/^\+/, "");
	return digits.startsWith("234") ? `+${digits}` : `+234${digits.replace(/^0/, "")}`;
}
