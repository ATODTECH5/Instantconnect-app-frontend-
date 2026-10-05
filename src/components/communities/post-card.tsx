import { Image } from "expo-image";
import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import HeartFilledIcon from "@/assets/communities/heart-filled.svg";
import HeartIcon from "@/assets/communities/heart.svg";
import MoreIcon from "@/assets/communities/more.svg";
import PinIcon from "@/assets/communities/pin.svg";
import ShareIcon from "@/assets/communities/share.svg";
import MessageIcon from "@/assets/support/message-circle.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import type { ApiCommunityPost } from "@/lib/api/community-schema";
import { formatTimeAgo } from "@/utils/format";

const AVATAR = 36;
const ICON = 20;
const MEDIA_ASPECT = 16 / 10;

export type PostCardProps = {
	post: ApiCommunityPost;
	onLike: (post: ApiCommunityPost) => void;
	onMore: (post: ApiCommunityPost) => void;
	onShare: (post: ApiCommunityPost) => void;
	/** Omitted on the thread itself, where the comments are already below. */
	onOpenThread?: (post: ApiCommunityPost) => void;
};

/** One post: author, text, an optional photo, and like, comment and share. */
export const PostCard = memo(function PostCard({
	post,
	onLike,
	onMore,
	onShare,
	onOpenThread,
}: PostCardProps) {
	const liked = post.viewer.hasLiked;
	const time = `${formatTimeAgo(post.createdAt)}${post.editedAt ? " • edited" : ""}`;

	return (
		<View style={styles.card}>
			{post.isPinned ? (
				<View style={styles.pinned}>
					<PinIcon color={Brand.purple} height={12} width={12} />
					<Text style={styles.pinnedLabel}>Pinned</Text>
				</View>
			) : null}

			<View style={styles.header}>
				<AvatarImage
					fullName={post.author.fullName}
					size={AVATAR}
					uri={post.author.avatarUrl}
				/>

				<View style={styles.byline}>
					<View style={styles.nameRow}>
						<Text numberOfLines={1} style={styles.name}>
							{post.author.fullName}
						</Text>

						{post.authorIsAdmin ? (
							<View style={styles.adminTag}>
								<Text style={styles.adminLabel}>ADMIN</Text>
							</View>
						) : null}
					</View>

					<Text style={styles.time}>{time}</Text>
				</View>

				<Pressable
					accessibilityHint="Opens actions for this post"
					accessibilityLabel="More"
					accessibilityRole="button"
					hitSlop={Spacing.three}
					onPress={() => onMore(post)}
					style={({ pressed }) => [styles.more, pressed && styles.pressed]}
				>
					<MoreIcon color={Ink.meta} height={ICON} width={ICON} />
				</Pressable>
			</View>

			{post.body ? <Text style={styles.body}>{post.body}</Text> : null}

			{post.mediaUrl ? (
				<Image
					accessibilityIgnoresInvertColors
					accessibilityLabel="Photo in this post"
					contentFit="cover"
					source={{ uri: post.mediaUrl }}
					style={styles.media}
					transition={200}
				/>
			) : null}

			<View style={styles.footer}>
				<Pressable
					accessibilityLabel={liked ? "Unlike" : "Like"}
					accessibilityRole="button"
					accessibilityState={{ selected: liked }}
					hitSlop={Spacing.two}
					onPress={() => onLike(post)}
					style={({ pressed }) => [styles.stat, pressed && styles.pressed]}
				>
					{liked ? (
						<HeartFilledIcon color={Ink.danger} height={ICON} width={ICON} />
					) : (
						<HeartIcon color={Ink.body} height={ICON} width={ICON} />
					)}
					<Text style={styles.statLabel}>{post.likeCount}</Text>
				</Pressable>

				<Pressable
					accessibilityLabel={`${post.commentCount} comments`}
					accessibilityRole="button"
					disabled={!onOpenThread}
					hitSlop={Spacing.two}
					onPress={() => onOpenThread?.(post)}
					style={({ pressed }) => [styles.stat, pressed && styles.pressed]}
				>
					<MessageIcon color={Ink.body} height={ICON} width={ICON} />
					<Text style={styles.statLabel}>{post.commentCount}</Text>
				</Pressable>

				<Pressable
					accessibilityLabel="Share"
					accessibilityRole="button"
					hitSlop={Spacing.two}
					onPress={() => onShare(post)}
					style={({ pressed }) => [styles.stat, styles.share, pressed && styles.pressed]}
				>
					<ShareIcon color={Ink.body} height={ICON} width={ICON} />
					<Text style={styles.statLabel}>Share</Text>
				</Pressable>
			</View>
		</View>
	);
});

const styles = StyleSheet.create({
	card: {
		gap: Gap.card,
		padding: Spacing.three,
		borderRadius: Radius.media,
		borderWidth: 1,
		borderColor: Ink.border,
		backgroundColor: Ink.surface,
		...Platform.select({
			ios: {
				shadowColor: Ink.title,
				shadowOpacity: 0.05,
				shadowRadius: 10,
				shadowOffset: { width: 0, height: 3 },
			},
			android: { elevation: 1 },
			default: {},
		}),
	},
	pinned: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	pinnedLabel: {
		...Type.cardMeta,
		color: Brand.purple,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
	},
	byline: {
		flex: 1,
		gap: Spacing.half,
	},
	nameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
	name: {
		...Type.resultName,
		flexShrink: 1,
		color: Ink.title,
	},
	adminTag: {
		paddingHorizontal: Spacing.two,
		paddingVertical: Spacing.half,
		borderRadius: Spacing.one,
		backgroundColor: Brand.purpleSurface,
	},
	adminLabel: {
		...Type.tagLabel,
		color: Brand.purple,
	},
	time: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	more: {
		width: MinTapTarget - Spacing.three,
		height: MinTapTarget - Spacing.three,
		alignItems: "center",
		justifyContent: "center",
	},
	body: {
		...Type.promoBody,
		lineHeight: 20,
		color: Ink.body,
	},
	media: {
		width: "100%",
		aspectRatio: MEDIA_ASPECT,
		borderRadius: Radius.control,
		backgroundColor: Ink.border,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.three,
		paddingTop: Gap.snug,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Ink.border,
	},
	stat: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
		minHeight: MinTapTarget - Spacing.three,
	},
	share: {
		marginLeft: "auto",
	},
	statLabel: {
		...Type.resultMeta,
		color: Ink.body,
	},
	pressed: {
		opacity: 0.7,
	},
});
