import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import { request } from "@/lib/api/api-client";
import {
	type ApiCommunityCommentPage,
	type ApiCommunityDetail,
	type ApiCommunityMember,
	type ApiCommunityMemberPage,
	type ApiCommunityPage,
	type ApiCommunityPost,
	type ApiCommunityPostPage,
	type ApiCommunityReply,
	type ApiInvitableConnectionPage,
	communityCommentPageSchema,
	communityDetailSchema,
	communityMemberPageSchema,
	communityMemberSchema,
	communityPageSchema,
	communityPostPageSchema,
	communityPostSchema,
	communityReplySchema,
	invitableConnectionPageSchema,
} from "@/lib/api/community-schema";
import { uploadToProvider } from "@/lib/api/direct-upload";
import { uploadSignatureSchema } from "@/lib/api/upload-signature-schema";

export type CommunityScope = "joined" | "mine" | "suggested" | "all";

export type CommunityDraft = {
	name: string;
	description?: string | null;
	categoryId?: string | null;
	coverStorageId?: string | null;
	isPublic: boolean;
};

export type ReportReason =
	| "spam"
	| "harassment"
	| "misinformation"
	| "hate_speech"
	| "violence"
	| "sexual_content"
	| "other";

/** The server's page cap. */
export const COMMUNITY_PAGE = 50;

const id = (value: string) => encodeURIComponent(value);

function withQuery(path: string, query: Record<string, string | number | undefined>): string {
	const params = Object.entries(query)
		.filter(
			(entry): entry is [string, string | number] =>
				entry[1] !== undefined && entry[1] !== "",
		)
		.map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
		.join("&");

	return params ? `${path}?${params}` : path;
}

export function fetchCommunities(
	scope: CommunityScope,
	limit: number,
	search?: string,
): Promise<ApiCommunityPage> {
	return request(withQuery("/communities", { scope, limit, search }), {
		schema: communityPageSchema,
		auth: true,
	});
}

export function fetchCommunity(communityId: string): Promise<ApiCommunityDetail> {
	return request(`/communities/${id(communityId)}`, {
		schema: communityDetailSchema,
		auth: true,
	});
}

export function createCommunity(
	draft: CommunityDraft & { inviteeIds: string[] },
): Promise<ApiCommunityDetail> {
	return request("/communities", {
		method: "POST",
		body: draft,
		schema: communityDetailSchema,
		auth: true,
	});
}

export function updateCommunity(
	communityId: string,
	changes: Partial<CommunityDraft>,
): Promise<ApiCommunityDetail> {
	return request(`/communities/${id(communityId)}`, {
		method: "PATCH",
		body: changes,
		schema: communityDetailSchema,
		auth: true,
	});
}

export function deleteCommunity(communityId: string): Promise<void> {
	return request(`/communities/${id(communityId)}`, { method: "DELETE", auth: true });
}

export function joinCommunity(communityId: string): Promise<ApiCommunityDetail> {
	return request(`/communities/${id(communityId)}/membership`, {
		method: "POST",
		schema: communityDetailSchema,
		auth: true,
	});
}

export function leaveCommunity(communityId: string): Promise<void> {
	return request(`/communities/${id(communityId)}/membership`, { method: "DELETE", auth: true });
}

export function fetchMembers(
	communityId: string,
	search?: string,
): Promise<ApiCommunityMemberPage> {
	return request(
		withQuery(`/communities/${id(communityId)}/members`, { limit: COMMUNITY_PAGE, search }),
		{ schema: communityMemberPageSchema, auth: true },
	);
}

export function setMemberAdmin(
	communityId: string,
	userId: string,
	isAdmin: boolean,
): Promise<ApiCommunityMember> {
	return request(`/communities/${id(communityId)}/members/${id(userId)}`, {
		method: "PATCH",
		body: { isAdmin },
		schema: communityMemberSchema,
		auth: true,
	});
}

export function removeMember(communityId: string, userId: string): Promise<void> {
	return request(`/communities/${id(communityId)}/members/${id(userId)}`, {
		method: "DELETE",
		auth: true,
	});
}

export function fetchInvitable(
	communityId: string,
	search?: string,
): Promise<ApiInvitableConnectionPage> {
	return request(
		withQuery(`/communities/${id(communityId)}/invitable`, { limit: COMMUNITY_PAGE, search }),
		{ schema: invitableConnectionPageSchema, auth: true },
	);
}

export function inviteToCommunity(communityId: string, userIds: string[]): Promise<void> {
	return request(`/communities/${id(communityId)}/invites`, {
		method: "POST",
		body: { userIds },
		auth: true,
	});
}

/** Device to provider, then the id goes on the community or the post. */
export async function uploadCommunityMedia(
	kind: "cover" | "post",
	photo: PickedPhoto,
): Promise<string> {
	const signature = await request(`/communities/upload-signature?kind=${kind}`, {
		method: "POST",
		schema: uploadSignatureSchema,
		auth: true,
	});

	return uploadToProvider(signature, photo);
}

export function fetchPosts(communityId: string, limit: number): Promise<ApiCommunityPostPage> {
	return request(withQuery(`/communities/${id(communityId)}/posts`, { limit }), {
		schema: communityPostPageSchema,
		auth: true,
	});
}

export function createPost(
	communityId: string,
	post: { body?: string; mediaStorageId?: string },
): Promise<ApiCommunityPost> {
	return request(`/communities/${id(communityId)}/posts`, {
		method: "POST",
		body: post,
		schema: communityPostSchema,
		auth: true,
	});
}

export function fetchPost(postId: string): Promise<ApiCommunityPost> {
	return request(`/community-posts/${id(postId)}`, { schema: communityPostSchema, auth: true });
}

export function editPost(postId: string, body: string): Promise<ApiCommunityPost> {
	return request(`/community-posts/${id(postId)}`, {
		method: "PATCH",
		body: { body },
		schema: communityPostSchema,
		auth: true,
	});
}

export function deletePost(postId: string): Promise<void> {
	return request(`/community-posts/${id(postId)}`, { method: "DELETE", auth: true });
}

/** Likes, pins and mutes share a shape: PUT sets, DELETE clears. */
export function togglePost(
	postId: string,
	action: "like" | "pin" | "mute",
	on: boolean,
): Promise<ApiCommunityPost> {
	return request(`/community-posts/${id(postId)}/${action}`, {
		method: on ? "PUT" : "DELETE",
		schema: communityPostSchema,
		auth: true,
	});
}

export function reportPost(postId: string, reason: ReportReason, details?: string): Promise<void> {
	return request(`/community-posts/${id(postId)}/reports`, {
		method: "POST",
		body: { reason, details: details || undefined },
		auth: true,
	});
}

export function fetchComments(postId: string): Promise<ApiCommunityCommentPage> {
	return request(
		withQuery(`/community-posts/${id(postId)}/comments`, { limit: COMMUNITY_PAGE }),
		{
			schema: communityCommentPageSchema,
			auth: true,
		},
	);
}

export function createComment(
	postId: string,
	body: string,
	parentId?: string,
): Promise<ApiCommunityReply> {
	return request(`/community-posts/${id(postId)}/comments`, {
		method: "POST",
		body: { body, parentId },
		schema: communityReplySchema,
		auth: true,
	});
}

export function deleteComment(commentId: string): Promise<void> {
	return request(`/community-comments/${id(commentId)}`, { method: "DELETE", auth: true });
}

export function toggleCommentLike(commentId: string, on: boolean): Promise<void> {
	return request(`/community-comments/${id(commentId)}/like`, {
		method: on ? "PUT" : "DELETE",
		auth: true,
	});
}
