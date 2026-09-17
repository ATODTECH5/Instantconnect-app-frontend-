/**
 * Placeholders from the design frames. Replace with the real desk before
 * launch: nothing else in the app knows these values.
 */
export const SUPPORT_EMAIL = "support@eventapp.com";
export const SUPPORT_WHATSAPP = "+234 800 000 0000";
export const SUPPORT_HOTLINE = "+234 800 000 0000";

export const SUPPORT_TEAM_NAME = "InstantConnect";

const digitsOf = (phone: string) => phone.replace(/[^\d+]/g, "");

export const supportLinks = {
	email: () => `mailto:${SUPPORT_EMAIL}`,
	whatsapp: () => `https://wa.me/${digitsOf(SUPPORT_WHATSAPP).replace(/^\+/, "")}`,
	hotline: () => `tel:${digitsOf(SUPPORT_HOTLINE)}`,
} as const;
