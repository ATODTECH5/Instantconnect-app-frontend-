import type { BillingCycle, PaidPlanId } from "@/features/subscription/plans";

/**
 * A stand-in for the payment provider (PRODUCT-STATUS §3.13, Phase 6). Every
 * call resolves after a short delay so the screens show their loading and
 * processing states the way they will against Paystack or Flutterwave. Nothing
 * here talks to the server and nothing is charged.
 */

export type PaymentMethodId = "card" | "bank" | "mobile" | "paystack";

export type PaymentMethod = {
	id: PaymentMethodId;
	label: string;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
	{ id: "card", label: "Credit / Debit Card" },
	{ id: "bank", label: "Bank Transfer" },
	{ id: "mobile", label: "Mobile Money (Opay, Palmpay)" },
	{ id: "paystack", label: "Paystack" },
];

export function isPaymentMethodId(value: unknown): value is PaymentMethodId {
	return PAYMENT_METHODS.some((method) => method.id === value);
}

export type CardDetails = {
	holderName: string;
	/** Digits only, spaces stripped. */
	number: string;
	/** "MM/YY" as typed. */
	expiry: string;
	cvv: string;
};

export type PaymentOrder = {
	planId: PaidPlanId;
	cycle: BillingCycle;
	method: PaymentMethodId;
	/** Last four digits, when the method is a card. */
	cardLast4?: string;
};

export const OTP_LENGTH = 4;

/** Enter this code to see the declined path. Any other four digits succeed. */
export const DECLINED_OTP = "0000";

const REQUEST_OTP_MS = 900;
const PROCESSING_MS = 2600;
const RESEND_COOLDOWN_SECONDS = 45;

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PaymentDeclinedError extends Error {
	constructor(message = "Incorrect OTP. Check the code and try again.") {
		super(message);
		this.name = "PaymentDeclinedError";
	}
}

/** Pretends to send an OTP to the phone on file. Returns the resend cooldown. */
export async function requestPaymentOtp(
	_order: PaymentOrder,
): Promise<{ cooldownSeconds: number }> {
	await wait(REQUEST_OTP_MS);

	return { cooldownSeconds: RESEND_COOLDOWN_SECONDS };
}

export type PaymentReceipt = {
	planId: PaidPlanId;
	cycle: BillingCycle;
	amount: number;
	paidAt: string;
	nextBillingAt: string;
};

export async function confirmPayment(
	order: PaymentOrder,
	otp: string,
	amount: number,
): Promise<PaymentReceipt> {
	await wait(PROCESSING_MS);

	if (otp === DECLINED_OTP) throw new PaymentDeclinedError();

	const paidAt = new Date();
	const nextBillingAt = new Date(paidAt);

	if (order.cycle === "monthly") nextBillingAt.setMonth(nextBillingAt.getMonth() + 1);
	else nextBillingAt.setFullYear(nextBillingAt.getFullYear() + 1);

	return {
		planId: order.planId,
		cycle: order.cycle,
		amount,
		paidAt: paidAt.toISOString(),
		nextBillingAt: nextBillingAt.toISOString(),
	};
}

/** Visa, Mastercard and Verve, the three brands the frame lists, are all 16 digits. */
export const CARD_NUMBER_LENGTH = 16;

/** Exactly sixteen digits that pass Luhn, so a typo is caught before the mock accepts it. */
export function isValidCardNumber(digits: string): boolean {
	if (digits.length !== CARD_NUMBER_LENGTH) return false;

	let sum = 0;
	let doubleIt = false;

	for (let index = digits.length - 1; index >= 0; index -= 1) {
		let digit = Number(digits[index]);

		if (doubleIt) {
			digit *= 2;
			if (digit > 9) digit -= 9;
		}

		sum += digit;
		doubleIt = !doubleIt;
	}

	return sum % 10 === 0;
}

/** "MM/YY", a real month, and not already past. */
export function isValidExpiry(expiry: string): boolean {
	const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
	if (!match) return false;

	const month = Number(match[1]);
	const year = 2000 + Number(match[2]);
	if (month < 1 || month > 12) return false;

	const now = new Date();
	const endOfMonth = new Date(year, month, 0, 23, 59, 59);

	return endOfMonth >= now;
}

/** Groups the digits in fours as the user types, "4318 1234 5678 9010", and stops at sixteen. */
export function formatCardNumber(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, CARD_NUMBER_LENGTH);

	return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** Slides a slash in after the month, so "0829" reads "08/29". */
export function formatExpiry(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 4);

	if (digits.length <= 2) return digits;

	return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
