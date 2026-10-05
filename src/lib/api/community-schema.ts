import { z } from "zod";

import { pageInfoSchema } from "@/lib/api/discovery-schema";

export const communityPersonSchema = z.object({
	id: z.string(),
	fullName: z.string(),
	username: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	isVerified: z.boolean(),
});

export const communitySummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	category: z.object({ id: z.string(), label: z.string() }).nullable(),
	coverUrl: z.string().nullable(),
	isPublic: z.boolean(),
	/** The Safety Community. */
	isOfficial: z.boolean(),
	memberCount: z.number(),
	memberPreview: z.array(communityPersonSchema),
	lastActivityAt: z.string(),
	viewer: z.object({
		isMember: z.boolean(),
		isAdmin: z.boolean(),
		isInvited: z.boolean(),
		canLeave: z.boolean(),
	}),
});

export const communityDetailSchema = communitySummarySchema.extend({
	creator: communityPersonSchema.nullable(),
	createdAt: z.string(),
});

export const communityPageSchema = z.object({
	items: z.array(communitySummarySchema),
	page: pageInfoSchema,
});

export const communityMemberSchema = communityPersonSchema.extend({
	isAdmin: z.boolean(),
	joinedAt: z.string(),
});

export const communityMemberPageSchema = z.object({
	items: z.array(communityMemberSchema),
	page: pageInfoSchema,
});

export const invitableConnectionPageSchema = z.object({
	items: z.array(communityPersonSchema.extend({ state: z.enum(["none", "invited", "member"]) })),
	page: pageInfoSchema,
});

export const communityPostSchema = z.object({
	id: z.string(),
	communityId: z.string(),
	author: communityPersonSchema,
	authorIsAdmin: z.boolean(),
	body: z.string().nullable(),
	mediaUrl: z.string().nullable(),
	isPinned: z.boolean(),
	editedAt: z.string().nullable(),
	likeCount: z.number(),
	commentCount: z.number(),
	createdAt: z.string(),
	viewer: z.object({
		hasLiked: z.boolean(),
		isMuted: z.boolean(),
		canEdit: z.boolean(),
		canDelete: z.boolean(),
		canPin: z.boolean(),
		canReport: z.boolean(),
	}),
});

export const communityPostPageSchema = z.object({
	items: z.array(communityPostSchema),
	page: pageInfoSchema,
});

export const communityReplySchema = z.object({
	id: z.string(),
	author: communityPersonSchema,
	authorIsAdmin: z.boolean(),
	body: z.string(),
	likeCount: z.number(),
	hasLiked: z.boolean(),
	canDelete: z.boolean(),
	createdAt: z.string(),
});

export const communityCommentSchema = communityReplySchema.extend({
	replies: z.array(communityReplySchema),
});

export const communityCommentPageSchema = z.object({
	items: z.array(communityCommentSchema),
	page: pageInfoSchema,
});

export type ApiCommunityPerson = z.infer<typeof communityPersonSchema>;
export type ApiCommunitySummary = z.infer<typeof communitySummarySchema>;
export type ApiCommunityDetail = z.infer<typeof communityDetailSchema>;
export type ApiCommunityPage = z.infer<typeof communityPageSchema>;
export type ApiCommunityMember = z.infer<typeof communityMemberSchema>;
export type ApiCommunityMemberPage = z.infer<typeof communityMemberPageSchema>;
export type ApiInvitableConnectionPage = z.infer<typeof invitableConnectionPageSchema>;
export type ApiCommunityPost = z.infer<typeof communityPostSchema>;
export type ApiCommunityPostPage = z.infer<typeof communityPostPageSchema>;
export type ApiCommunityReply = z.infer<typeof communityReplySchema>;
export type ApiCommunityComment = z.infer<typeof communityCommentSchema>;
export type ApiCommunityCommentPage = z.infer<typeof communityCommentPageSchema>;
