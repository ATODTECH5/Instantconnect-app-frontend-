import { Alert, Linking } from "react-native";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";

import type { ApiEventSummary } from "@/lib/api/event-schema";

const MEMBER_EVENT = "instant_connect";

const SOURCE_NAMES: Record<string, string> = {
	eventbrite: "Eventbrite",
};

/** Null for an event a member created; otherwise the listing it came from. */
export function externalSourceName(event: Pick<ApiEventSummary, "source">): string | null {
	if (event.source === MEMBER_EVENT) return null;

	return SOURCE_NAMES[event.source] ?? "the organiser";
}

/**
 * The in app browser keeps people one swipe from the event. Some Android
 * devices have no Custom Tabs browser, so fall back to the system handler.
 */
export async function openRegistration(url: string): Promise<void> {
	try {
		await openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
	} catch {
		try {
			await Linking.openURL(url);
		} catch {
			Alert.alert("Could not open the link", "Try again in a moment.");
		}
	}
}
