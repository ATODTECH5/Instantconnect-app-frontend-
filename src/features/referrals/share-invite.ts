import { Linking, Platform, Share } from "react-native";

import { copyToClipboard } from "@/utils/clipboard";

export type ShareTarget = "message" | "whatsapp" | "instagram" | "x";

/**
 * A deep link into Sign Up with the code prefilled. Only a phone with the
 * app installed can open it; the invite text carries the code in plain
 * words as well, so nobody is stranded. Swap for a universal link once the
 * product has a web domain.
 */
export function inviteLink(code: string): string {
	return `instantconnectclient://sign-up?ref=${encodeURIComponent(code)}`;
}

export function inviteMessage(code: string): string {
	return (
		`Join me on Instant Connect and we both unlock perks. ` +
		`Use my invite code ${code} when you sign up: ${inviteLink(code)}`
	);
}

export function copyInviteCode(code: string): void {
	copyToClipboard(code);
}

export function copyInviteLink(code: string): void {
	copyToClipboard(inviteLink(code));
}

/**
 * Resolves true once the invite has left the app: the other app opened, or
 * the system sheet reported a share. A dismissed sheet resolves false so the
 * caller does not celebrate an invite that never went anywhere.
 */
export async function shareInvite(target: ShareTarget, code: string): Promise<boolean> {
	const message = inviteMessage(code);
	const text = encodeURIComponent(message);

	switch (target) {
		case "message":
			// iOS and Android spell the body parameter differently.
			return openExternal(Platform.OS === "ios" ? `sms:&body=${text}` : `sms:?body=${text}`);
		case "whatsapp":
			// wa.me hands off to the app when it is installed and to the web otherwise.
			return openExternal(`https://wa.me/?text=${text}`);
		case "x":
			return openExternal(`https://twitter.com/intent/tweet?text=${text}`);
		case "instagram":
			// Instagram has no text intent, so the system sheet is the only route in.
			return shareThroughSystemSheet(message);
	}
}

async function openExternal(url: string): Promise<boolean> {
	try {
		await Linking.openURL(url);

		return true;
	} catch {
		return shareThroughSystemSheet(decodeURIComponent(url.split("text=")[1] ?? ""));
	}
}

async function shareThroughSystemSheet(message: string): Promise<boolean> {
	try {
		const result = await Share.share({ message });

		return result.action === Share.sharedAction;
	} catch {
		return false;
	}
}
