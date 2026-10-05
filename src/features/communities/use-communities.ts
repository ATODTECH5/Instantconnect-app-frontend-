import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import type { PickedPhoto } from "@/features/profile/use-pick-photo";
import type {
	ApiCommunityCommentPage,
	ApiCommunityDetail,
	ApiCommunityMemberPage,
	ApiCommunityPage,
	ApiCommunityPost,
	ApiCommunityPostPage,
	ApiInvitableConnectionPage,
} from "@/lib/api/community-schema";
import {
	type CommunityDraft,
	type CommunityScope,
	createComment,
	createCommunity,
	createPost,
	deleteComment,
	deleteCommunity,
	deletePost,
	editPost,
	fetchComments,
	fetchCommunities,
	fetchCommunity,
	fetchInvitable,
	fetchMembers,
	fetchPost,
	fetchPosts,
	inviteToCommunity,
	joinCommunity,
	leaveCommunity,
	removeMember,
	reportPost,
	type ReportReason,
	setMemberAdmin,
	toggleCommentLike,
	togglePost,
	updateCommunity,
	uploadCommunityMedia,
} from "./community-service";

export const COMMUNITIES_KEY = ["communities"] as const;
const POSTS_KEY = ["community-posts"] as const;

const listKey = (scope: CommunityScope, limit: number, search: string) =>
	[...COMMUNITIES_KEY, "list", scope, limit, search] as const;
const detailKey = (id: string) => [...COMMUNITIES_KEY, "detail", id] as const;
const membersKey = (id: string, search: string) =>
	[...COMMUNITIES_KEY, "members", id, search] as const;
const invitableKey = (id: string, search: string) =>
	[...COMMUNITIES_KEY, "invitable", id, search] as const;
const feedKey = (communityId: string) => [...POSTS_KEY, "feed", communityId] as const;
const postKey = (postId: string) => [...POSTS_KEY, "detail", postId] as const;
const commentsKey = (postId: string) => [...POSTS_KEY, "comments", postId] as const;

/** Enough for a feed to feel complete; older posts wait for paging. */
const FEED_PAGE = 30;

export function useCommunities(
	scope: CommunityScope,
	limit: number,
	search = "",
	enabled = true,
): UseQueryResult<ApiCommunityPage> {
	return useQuery({
		queryKey: listKey(scope, limit, search),
		queryFn: () => fetchCommunities(scope, limit, search || undefined),
		enabled,
	});
}

export function useCommunity(id: string): UseQueryResult<ApiCommunityDetail> {
	return useQuery({ queryKey: detailKey(id), queryFn: () => fetchCommunity(id), enabled: !!id });
}

export function useCommunityMembers(
	id: string,
	search: string,
): UseQueryResult<ApiCommunityMemberPage> {
	return useQuery({
		queryKey: membersKey(id, search),
		queryFn: () => fetchMembers(id, search || undefined),
		enabled: !!id,
	});
}

export function useInvitable(
	id: string,
	search: string,
	enabled: boolean,
): UseQueryResult<ApiInvitableConnectionPage> {
	return useQuery({
		queryKey: invitableKey(id, search),
		queryFn: () => fetchInvitable(id, search || undefined),
		enabled: enabled && !!id,
	});
}

export function useCommunityFeed(communityId: string): UseQueryResult<ApiCommunityPostPage> {
	return useQuery({
		queryKey: feedKey(communityId),
		queryFn: () => fetchPosts(communityId, FEED_PAGE),
		enabled: !!communityId,
	});
}

export function useCommunityPost(postId: string): UseQueryResult<ApiCommunityPost> {
	return useQuery({
		queryKey: postKey(postId),
		queryFn: () => fetchPost(postId),
		enabled: !!postId,
	});
}

export function usePostComments(postId: string): UseQueryResult<ApiCommunityCommentPage> {
	return useQuery({
		queryKey: commentsKey(postId),
		queryFn: () => fetchComments(postId),
		enabled: !!postId,
	});
}

export function useUploadCommunityMedia(): UseMutationResult<
	string,
	Error,
	{ kind: "cover" | "post"; photo: PickedPhoto }
> {
	return useMutation({ mutationFn: ({ kind, photo }) => uploadCommunityMedia(kind, photo) });
}

/** Every community surface: lists, counts on the profile header, and details. */
function useInvalidateCommunities() {
	const client = useQueryClient();

	return () => {
		void client.invalidateQueries({ queryKey: COMMUNITIES_KEY });
		void client.invalidateQueries({ queryKey: ["users", "me"] });
	};
}

export function useCreateCommunity(): UseMutationResult<
	ApiCommunityDetail,
	Error,
	CommunityDraft & { inviteeIds: string[] }
> {
	const client = useQueryClient();
	const invalidate = useInvalidateCommunities();

	return useMutation({
		mutationFn: createCommunity,
		onSuccess: (community) => {
			client.setQueryData(detailKey(community.id), community);
			invalidate();
		},
	});
}

export function useUpdateCommunity(
	id: string,
): UseMutationResult<ApiCommunityDetail, Error, Partial<CommunityDraft>> {
	const client = useQueryClient();
	const invalidate = useInvalidateCommunities();

	return useMutation({
		mutationFn: (changes) => updateCommunity(id, changes),
		onSuccess: (community) => {
			client.setQueryData(detailKey(id), community);
			invalidate();
		},
	});
}

export function useDeleteCommunity(): UseMutationResult<void, Error, string> {
	const invalidate = useInvalidateCommunities();

	return useMutation({ mutationFn: deleteCommunity, onSuccess: invalidate });
}

export function useJoinCommunity(): UseMutationResult<ApiCommunityDetail, Error, string> {
	const client = useQueryClient();
	const invalidate = useInvalidateCommunities();

	return useMutation({
		mutationFn: joinCommunity,
		onSuccess: (community) => {
			client.setQueryData(detailKey(community.id), community);
			invalidate();
		},
	});
}

export function useLeaveCommunity(): UseMutationResult<void, Error, string> {
	const invalidate = useInvalidateCommunities();

	return useMutation({ mutationFn: leaveCommunity, onSuccess: invalidate });
}

export function useSetMemberAdmin(
	communityId: string,
): UseMutationResult<unknown, Error, { userId: string; isAdmin: boolean }> {
	const invalidate = useInvalidateCommunities();

	return useMutation({
		mutationFn: ({ userId, isAdmin }) => setMemberAdmin(communityId, userId, isAdmin),
		onSuccess: invalidate,
	});
}

export function useRemoveMember(communityId: string): UseMutationResult<void, Error, string> {
	const invalidate = useInvalidateCommunities();

	return useMutation({
		mutationFn: (userId) => removeMember(communityId, userId),
		onSuccess: invalidate,
	});
}

export function useInviteToCommunity(
	communityId: string,
): UseMutationResult<void, Error, string[]> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: (userIds) => inviteToCommunity(communityId, userIds),
		onSuccess: () => {
			void client.invalidateQueries({
				queryKey: [...COMMUNITIES_KEY, "invitable", communityId],
			});
		},
	});
}

/**
 * A post answer replaces its own cache entry and refreshes the feed it sits
 * in, so a like or a pin shows on both screens without a second request.
 */
function useApplyPost() {
	const client = useQueryClient();

	return (post: ApiCommunityPost) => {
		client.setQueryData(postKey(post.id), post);
		void client.invalidateQueries({ queryKey: feedKey(post.communityId) });
	};
}

export function useCreatePost(
	communityId: string,
): UseMutationResult<ApiCommunityPost, Error, { body?: string; mediaStorageId?: string }> {
	const apply = useApplyPost();
	const client = useQueryClient();

	return useMutation({
		mutationFn: (post) => createPost(communityId, post),
		onSuccess: (post) => {
			apply(post);
			void client.invalidateQueries({ queryKey: COMMUNITIES_KEY });
		},
	});
}

export function useEditPost(): UseMutationResult<
	ApiCommunityPost,
	Error,
	{ postId: string; body: string }
> {
	const apply = useApplyPost();

	return useMutation({
		mutationFn: ({ postId, body }) => editPost(postId, body),
		onSuccess: apply,
	});
}

export function useTogglePost(): UseMutationResult<
	ApiCommunityPost,
	Error,
	{ postId: string; action: "like" | "pin" | "mute"; on: boolean }
> {
	const apply = useApplyPost();

	return useMutation({
		mutationFn: ({ postId, action, on }) => togglePost(postId, action, on),
		onSuccess: apply,
	});
}

export function useDeletePost(communityId: string): UseMutationResult<void, Error, string> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: deletePost,
		onSuccess: () => void client.invalidateQueries({ queryKey: feedKey(communityId) }),
	});
}

export function useReportPost(): UseMutationResult<
	void,
	Error,
	{ postId: string; reason: ReportReason; details?: string }
> {
	return useMutation({
		mutationFn: ({ postId, reason, details }) => reportPost(postId, reason, details),
	});
}

/** Comments change the post's count, so the post and its feed refresh too. */
function useRefreshThread(postId: string, communityId: string | undefined) {
	const client = useQueryClient();

	return () => {
		void client.invalidateQueries({ queryKey: commentsKey(postId) });
		void client.invalidateQueries({ queryKey: postKey(postId) });
		if (communityId) void client.invalidateQueries({ queryKey: feedKey(communityId) });
	};
}

export function useCreateComment(
	postId: string,
	communityId: string | undefined,
): UseMutationResult<unknown, Error, { body: string; parentId?: string }> {
	const refresh = useRefreshThread(postId, communityId);

	return useMutation({
		mutationFn: ({ body, parentId }) => createComment(postId, body, parentId),
		onSuccess: refresh,
	});
}

export function useDeleteComment(
	postId: string,
	communityId: string | undefined,
): UseMutationResult<void, Error, string> {
	const refresh = useRefreshThread(postId, communityId);

	return useMutation({ mutationFn: deleteComment, onSuccess: refresh });
}

export function useToggleCommentLike(
	postId: string,
): UseMutationResult<void, Error, { commentId: string; on: boolean }> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId, on }) => toggleCommentLike(commentId, on),
		onSuccess: () => void client.invalidateQueries({ queryKey: commentsKey(postId) }),
	});
}
