import { z } from "zod";

/**
 * Mirrors the server's `common/utils/age.util.ts` and
 * `auth/dto/date-of-birth.decorator.ts`. Both ends have to agree, so the two
 * definitions must be changed together.
 *
 * Age is a gate rather than a preference: the app arranges meetups between
 * strangers, so an account below MINIMUM_AGE must never be created.
 */
export const MINIMUM_AGE = 18;

const MAXIMUM_AGE = 120;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MASKED_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** Formats digits as they are typed, so 12041998 reads back as 12/04/1998. */
export function maskDateOfBirth(value: string): string {
	const digits = value.replace(/\D/g, "").slice(0, 8);

	return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
		.filter((part) => part.length > 0)
		.join("/");
}

/** The API takes a calendar date; the field shows the order people write it in. */
export function toIsoDate(masked: string): string | null {
	const parts = MASKED_DATE.exec(masked);

	if (!parts) return null;

	const [, day, month, year] = parts;

	return `${year}-${month}-${day}`;
}

/**
 * Rejects the dates the pattern alone accepts, such as 2003-02-30. Round
 * tripping through UTC is the cheapest way to ask the same question Postgres
 * would: a date that does not exist normalises to a different one.
 */
export function isCalendarDate(value: string): boolean {
	if (!ISO_DATE.test(value)) return false;

	const parsed = new Date(`${value}T00:00:00Z`);

	return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

/**
 * Whole years elapsed, where a birthday counts only once both the month and the
 * day have passed. The comparison stays on calendar fields because a date of
 * birth carries no timezone, and lifting it into one would move a birthday by a
 * day either side of the meridian.
 */
export function ageOn(isoDate: string, on: Date = new Date()): number {
	const parts = ISO_DATE.exec(isoDate);

	if (!parts) throw new TypeError(`Expected YYYY-MM-DD, received "${isoDate}"`);

	const [, birthYear, birthMonth, birthDay] = parts.map(Number);
	const hasHadBirthday =
		on.getUTCMonth() + 1 > birthMonth ||
		(on.getUTCMonth() + 1 === birthMonth && on.getUTCDate() >= birthDay);

	return on.getUTCFullYear() - birthYear - (hasHadBirthday ? 0 : 1);
}

export const dateOfBirthSchema = z.string().trim().transform((value, ctx) => {
	const iso = toIsoDate(value);

	if (!iso || !isCalendarDate(iso)) {
		ctx.addIssue({ code: "custom", message: "Enter your date of birth as DD/MM/YYYY" });

		return z.NEVER;
	}

	const age = ageOn(iso);

	if (age < 0) {
		ctx.addIssue({ code: "custom", message: "Enter a date in the past" });

		return z.NEVER;
	}

	if (age < MINIMUM_AGE) {
		ctx.addIssue({
			code: "custom",
			message: `You must be at least ${MINIMUM_AGE} to join Instant Connect`,
		});

		return z.NEVER;
	}

	if (age > MAXIMUM_AGE) {
		ctx.addIssue({ code: "custom", message: "Enter a valid date of birth" });

		return z.NEVER;
	}

	return iso;
});
