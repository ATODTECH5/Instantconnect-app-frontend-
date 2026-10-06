import { Share } from "react-native";

import { getApiBaseUrl } from "@/lib/api/api-config";

/**
 * Shared links are https pages on the API that hand over to the app, because
 * chat apps only make http(s) links tappable. Swap for a universal link once
 * there is a domain.
 */
export const communityLink = (communityId: string) =>
	`${getApiBaseUrl()}/links/communities/${communityId}`;

export const postLink = (postId: string) => `${getApiBaseUrl()}/links/community-posts/${postId}`;

/** The system share sheet. A dismissed sheet is not an error. */
export async function shareLink(message: string, url: string): Promise<void> {
	try {
		await Share.share({ message: `${message}\n${url}`, url });
	} catch {
		// Share rejects only when the platform has no sheet to show; nothing to recover.
	}
}
