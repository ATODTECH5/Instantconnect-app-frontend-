import { createURL } from "expo-linking";
import { Share } from "react-native";

export const communityLink = (communityId: string) => createURL(`/communities/${communityId}`);

export const postLink = (postId: string) => createURL(`/communities/posts/${postId}`);

/** The system share sheet. A dismissed sheet is not an error. */
export async function shareLink(message: string, url: string): Promise<void> {
	try {
		await Share.share({ message: `${message}\n${url}`, url });
	} catch {
		// Share rejects only when the platform has no sheet to show; nothing to recover.
	}
}
