import type { Href } from "expo-router";

/**
 * Where a notification opens, shared by a tap on the Notifications screen and
 * a tap on a push, so the two can never disagree. A connection notification has
 * nowhere of its own to go, so it lands on the Connection tab, as does a kind
 * this build does not know yet.
 */
export function notificationRoute(kind: string, subjectId: string | null): Href {
	if ((kind === "message" || kind === "meetup_safety_check") && subjectId) {
		return `/chat/${subjectId}`;
	}

	if (kind === "referral_joined" && subjectId) {
		return `/profile/refer/joined/${subjectId}`;
	}

	if ((kind === "event_invite" || kind === "event_joined") && subjectId) {
		return `/events/${subjectId}`;
	}

	if (kind === "community_invite" && subjectId) return `/communities/${subjectId}`;

	if ((kind === "community_comment" || kind === "community_reply") && subjectId) {
		return `/communities/posts/${subjectId}`;
	}

	if (kind === "kyc_approved" || kind === "kyc_rejected") return "/profile/kyc";

	return "/(tabs)/connection";
}
