import { z } from "zod";

import { passwordSchema } from "@/features/auth/password-rules";

export const forgotPasswordSchema = z.object({
	email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
});

export type ForgotPasswordValues = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordInput = z.output<typeof forgotPasswordSchema>;

export const newPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Re-enter your new password"),
	})
	.refine((values) => values.password === values.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type NewPasswordValues = z.input<typeof newPasswordSchema>;
export type NewPasswordInput = z.output<typeof newPasswordSchema>;
