import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useState } from "react";
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeartFilledIcon from "@/assets/communities/heart-filled.svg";
import HeartIcon from "@/assets/communities/heart.svg";
import { PostActions } from "@/components/communities/post-actions";
import { PostCard } from "@/components/communities/post-card";
import { PostComposer } from "@/components/communities/post-composer";
import { ScreenHeader } from "@/components/nav/screen-header";
import { AvatarImage } from "@/components/ui/avatar-image";
import { StateMessage } from "@/components/ui/state-message";
import { Toast } from "@/components/ui/toast";
import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { postLink, shareLink } from "@/features/communities/community-links";
import {
	useCommunity,
	useCommunityPost,
	useCreateComment,
	useDeleteComment,
	usePostComments,
	useToggleCommentLike,
	useTogglePost,
} from "@/features/communities/use-communities";
import { useProfile } from "@/features/profile/use-profile";
import { describeError } from "@/lib/api/api-error";
import type {
	ApiCommunityComment,
	ApiCommunityPost,
	ApiCommunityReply,
} from "@/lib/api/community-schema";
import { formatTimeAgo } from "@/utils/format";

const AVATAR = 32;
const ICON = 18;
const COMMENT_MAX = 1000;

type ReplyTarget = { commentId: string; name: string };

/** A post with its comments. A reply always attaches to a top level comment. */
export default function PostThreadScreen() {
	const { id = "" } = useLocalSearchParams<{ id: string }>();
	const post = useCommunityPost(id);
	const communityId = post.data?.communityId;
	const community = useCommunity(communityId ?? "");
	const comments = usePostComments(id);
	const profile = useProfile();
	const toggle = useTogglePost();
	const createComment = useCreateComment(id, communityId);
	const deleteComment = useDeleteComment(id, communityId);
	const likeComment = useToggleCommentLike(id);

	const [acting, setActing] = useState<ApiCommunityPost | null>(null);
	const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
	const [error, setError] = useState<string | null>(null);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/communities");
	}, []);

	const fail = useCallback((cause: unknown) => setError(describeError(cause)), []);

	const onLikeComment = useCallback(
		(comment: ApiCommunityReply) =>
			likeComment.mutate({ commentId: comment.id, on: !comment.hasLiked }, { onError: fail }),
		[fail, likeComment],
	);

	const onDeleteComment = useCallback(
		(comment: ApiCommunityReply) => deleteComment.mutate(comment.id, { onError: fail }),
		[deleteComment, fail],
	);

	const renderComment = useCallback(
		({ item }: { item: ApiCommunityComment }) => (
			<CommentThread
				comment={item}
				onDelete={onDeleteComment}
				onLike={onLikeComment}
				onReply={(target) => setReplyTo(target)}
			/>
		),
		[onDeleteComment, onLikeComment],
	);

	const canComment = community.data?.viewer.isMember ?? false;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.flex}
			>
				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="Post Thread" />

					{post.isPending ? (
						<StateMessage message="Loading post…" />
					) : post.isError ? (
						<StateMessage
							actionLabel="Try again"
							isError
							message={describeError(post.error)}
							onPressAction={() => void post.refetch()}
						/>
					) : (
						<FlatList
							ListEmptyComponent={
								comments.isPending ? (
									<StateMessage message="Loading comments…" />
								) : comments.isError ? (
									<StateMessage
										actionLabel="Try again"
										isError
										message={describeError(comments.error)}
										onPressAction={() => void comments.refetch()}
									/>
								) : (
									<Text style={styles.empty}>No comments yet. Be the first.</Text>
								)
							}
							ListHeaderComponent={
								<View style={styles.header}>
									<PostCard
										onLike={(target) =>
											toggle.mutate(
												{
													postId: target.id,
													action: "like",
													on: !target.viewer.hasLiked,
												},
												{ onError: fail },
											)
										}
										onMore={setActing}
										onShare={(target) =>
											void shareLink(
												`${target.author.fullName} on Instant Connect`,
												postLink(target.id),
											)
										}
										post={post.data}
									/>

									<Text accessibilityRole="header" style={styles.sectionTitle}>
										Comments
									</Text>
								</View>
							}
							contentContainerStyle={styles.list}
							data={comments.data?.items ?? []}
							keyExtractor={(item) => item.id}
							keyboardShouldPersistTaps="handled"
							renderItem={renderComment}
							showsVerticalScrollIndicator={false}
						/>
					)}
				</View>

				{post.data && canComment ? (
					<PostComposer
						context={
							replyTo
								? {
										label: `Replying to ${replyTo.name}`,
										onClear: () => setReplyTo(null),
									}
								: null
						}
						isSending={createComment.isPending}
						maxLength={COMMENT_MAX}
						onSend={(body) =>
							createComment.mutate(
								{ body, parentId: replyTo?.commentId },
								{ onSuccess: () => setReplyTo(null), onError: fail },
							)
						}
						placeholder={replyTo ? "Write a reply..." : "Type a message..."}
						viewer={
							profile.data
								? {
										fullName: profile.data.fullName,
										avatarUrl: profile.data.avatarUrl,
									}
								: null
						}
					/>
				) : post.data && community.data ? (
					<Text style={styles.joinNote}>Join this community to comment.</Text>
				) : null}
			</KeyboardAvoidingView>

			{communityId ? (
				<PostActions
					communityId={communityId}
					onClose={() => setActing(null)}
					onDeleted={goBack}
					post={acting}
				/>
			) : null}

			{error ? <Toast message={error} onDismiss={() => setError(null)} tone="error" /> : null}
		</SafeAreaView>
	);
}

type CommentHandlers = {
	onLike: (comment: ApiCommunityReply) => void;
	onDelete: (comment: ApiCommunityReply) => void;
};

const CommentThread = memo(function CommentThread({
	comment,
	onReply,
	...handlers
}: CommentHandlers & { comment: ApiCommunityComment; onReply: (target: ReplyTarget) => void }) {
	return (
		<View style={styles.thread}>
			<CommentBubble
				comment={comment}
				onReply={() =>
					onReply({ commentId: comment.id, name: comment.author.fullName.split(" ")[0] })
				}
				{...handlers}
			/>

			{comment.replies.map((reply) => (
				<View key={reply.id} style={styles.replyRow}>
					<View style={styles.replyRail} />
					<View style={styles.flex}>
						<CommentBubble
							comment={reply}
							isReply
							onReply={() =>
								onReply({
									commentId: comment.id,
									name: reply.author.fullName.split(" ")[0],
								})
							}
							{...handlers}
						/>
					</View>
				</View>
			))}
		</View>
	);
});

function CommentBubble({
	comment,
	isReply = false,
	onLike,
	onDelete,
	onReply,
}: CommentHandlers & { comment: ApiCommunityReply; isReply?: boolean; onReply: () => void }) {
	return (
		<View style={[styles.bubble, isReply && comment.authorIsAdmin && styles.bubbleAdmin]}>
			<View style={styles.bubbleHeader}>
				<AvatarImage
					fullName={comment.author.fullName}
					size={AVATAR}
					uri={comment.author.avatarUrl}
				/>

				<View style={styles.byline}>
					<Text
						numberOfLines={1}
						style={[styles.name, comment.authorIsAdmin && styles.nameAdmin]}
					>
						{comment.author.fullName}
						{comment.authorIsAdmin ? " (Admin)" : ""}
					</Text>
					<Text style={styles.time}>{formatTimeAgo(comment.createdAt)}</Text>
				</View>

				<Pressable
					accessibilityLabel={comment.hasLiked ? "Unlike comment" : "Like comment"}
					accessibilityRole="button"
					accessibilityState={{ selected: comment.hasLiked }}
					hitSlop={Spacing.three}
					onPress={() => onLike(comment)}
					style={styles.like}
				>
					{comment.hasLiked ? (
						<HeartFilledIcon color={Ink.danger} height={ICON} width={ICON} />
					) : (
						<HeartIcon color={Ink.meta} height={ICON} width={ICON} />
					)}
					{comment.likeCount > 0 ? (
						<Text style={styles.likeCount}>{comment.likeCount}</Text>
					) : null}
				</Pressable>
			</View>

			<Text style={styles.body}>{comment.body}</Text>

			<View style={styles.bubbleActions}>
				<Pressable
					accessibilityLabel="Reply"
					accessibilityRole="button"
					hitSlop={Spacing.three}
					onPress={onReply}
				>
					<Text style={styles.actionLabel}>Reply</Text>
				</Pressable>

				{comment.canDelete ? (
					<Pressable
						accessibilityLabel="Delete comment"
						accessibilityRole="button"
						hitSlop={Spacing.three}
						onPress={() => onDelete(comment)}
					>
						<Text style={[styles.actionLabel, styles.danger]}>Delete</Text>
					</Pressable>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	flex: {
		flex: 1,
	},
	column: {
		flex: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	list: {
		gap: Gap.card,
		paddingBottom: Spacing.four,
	},
	header: {
		gap: Gap.section,
	},
	sectionTitle: {
		...Type.sectionTitle,
		color: Ink.title,
	},
	empty: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	thread: {
		gap: Spacing.two,
	},
	replyRow: {
		flexDirection: "row",
		gap: Spacing.two,
	},
	replyRail: {
		width: Spacing.three,
		borderBottomLeftRadius: Radius.control,
		borderLeftWidth: 2,
		borderBottomWidth: 2,
		borderColor: Brand.purpleTint,
		height: Spacing.five,
		marginLeft: Spacing.two,
	},
	bubble: {
		gap: Spacing.two,
		padding: Gap.card,
		borderRadius: Radius.media,
		borderWidth: 1,
		borderColor: Ink.border,
		backgroundColor: Ink.surface,
	},
	bubbleAdmin: {
		borderColor: Brand.purpleTint,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	bubbleHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
	},
	byline: {
		flex: 1,
		gap: Spacing.half,
	},
	name: {
		...Type.cardName,
		fontSize: 14,
		color: Ink.title,
	},
	nameAdmin: {
		color: Brand.purple,
	},
	time: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	like: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	likeCount: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	body: {
		...Type.promoBody,
		color: Ink.body,
	},
	bubbleActions: {
		flexDirection: "row",
		gap: Spacing.three,
	},
	actionLabel: {
		...Type.cardAction,
		color: Brand.purple,
	},
	danger: {
		color: Ink.danger,
	},
	joinNote: {
		...Type.resultMeta,
		color: Ink.meta,
		textAlign: "center",
		paddingVertical: Spacing.three,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Ink.border,
	},
});
