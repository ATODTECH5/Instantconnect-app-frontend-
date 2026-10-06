import { Image } from "expo-image";
import type { ImagePickerOptions } from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import ArrowLeftIcon from "@/assets/auth/arrow-left.svg";
import SettingsIcon from "@/assets/communities/settings.svg";
import { CommunityInviteSheet } from "@/components/communities/community-invite-sheet";
import { PostActions } from "@/components/communities/post-actions";
import { PostCard } from "@/components/communities/post-card";
import { type ComposerAttachment, PostComposer } from "@/components/communities/post-composer";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StateMessage } from "@/components/ui/state-message";
import { Toast } from "@/components/ui/toast";
import {
	Brand,
	BrandGradient,
	Gap,
	Ink,
	MaxColumnWidth,
	MediaScrim,
	MinTapTarget,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import { communityInitials, memberCountLabel } from "@/features/communities/community-copy";
import { postLink, shareLink } from "@/features/communities/community-links";
import {
	useCommunity,
	useCommunityFeed,
	useCreatePost,
	useJoinCommunity,
	useLeaveCommunity,
	useTogglePost,
	useUploadCommunityMedia,
} from "@/features/communities/use-communities";
import { useProfile } from "@/features/profile/use-profile";
import { usePickPhoto } from "@/features/profile/use-pick-photo";
import { describeError } from "@/lib/api/api-error";
import type { ApiCommunityDetail, ApiCommunityPost } from "@/lib/api/community-schema";

const HERO_HEIGHT = 168;
const LOGO = 80;
const ROUND = 44;
const ICON = 22;
const POST_MAX = 2000;

const PHOTO_OPTIONS: ImagePickerOptions = { mediaTypes: ["images"], quality: 0.85 };

export default function CommunityScreen() {
	const { id = "" } = useLocalSearchParams<{ id: string }>();
	const community = useCommunity(id);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/communities");
	}, []);

	if (community.isPending || community.isError) {
		return (
			<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
				<StatusBar style="dark" />
				<View style={styles.stateColumn}>
					<RoundButton label="Go back" onPress={goBack} tone="light">
						<ArrowLeftIcon color={Ink.title} height={ICON} width={ICON} />
					</RoundButton>

					{community.isPending ? (
						<StateMessage message="Loading community…" />
					) : (
						<StateMessage
							actionLabel="Try again"
							isError
							message={describeError(community.error)}
							onPressAction={() => void community.refetch()}
						/>
					)}
				</View>
			</SafeAreaView>
		);
	}

	return <CommunityBody community={community.data} onBack={goBack} />;
}

function CommunityBody({
	community,
	onBack,
}: {
	community: ApiCommunityDetail;
	onBack: () => void;
}) {
	const insets = useSafeAreaInsets();
	const detail = useCommunity(community.id);
	const feed = useCommunityFeed(community.id);
	const profile = useProfile();
	const refetchDetail = detail.refetch;
	const refetchFeed = feed.refetch;
	const hasFocused = useRef(false);

	// Other members join, post and comment while this screen sits in the stack.
	useFocusEffect(
		useCallback(() => {
			if (!hasFocused.current) {
				hasFocused.current = true;
				return;
			}

			void refetchDetail();
			void refetchFeed();
		}, [refetchDetail, refetchFeed]),
	);
	const join = useJoinCommunity();
	const leave = useLeaveCommunity();
	const createPost = useCreatePost(community.id);
	const toggle = useTogglePost();
	const upload = useUploadCommunityMedia();
	const pickPhoto = usePickPhoto(PHOTO_OPTIONS);

	const [acting, setActing] = useState<ApiCommunityPost | null>(null);
	const [inviting, setInviting] = useState(false);
	const [confirmLeave, setConfirmLeave] = useState(false);
	const [attachment, setAttachment] = useState<
		(ComposerAttachment & { storageId: string | null }) | null
	>(null);
	const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

	const { viewer } = community;
	const canInvite =
		!community.isOfficial && (viewer.isAdmin || (viewer.isMember && community.isPublic));
	const canJoin = !viewer.isMember && (community.isPublic || viewer.isInvited);
	const fail = useCallback(
		(cause: unknown) => setToast({ message: describeError(cause), tone: "error" }),
		[],
	);

	const attach = useCallback(async () => {
		const photo = await pickPhoto();

		if (!photo) return;

		setAttachment({ uri: photo.uri, uploading: true, storageId: null });

		try {
			const storageId = await upload.mutateAsync({ kind: "post", photo });

			setAttachment({ uri: photo.uri, uploading: false, storageId });
		} catch (cause) {
			setAttachment(null);
			fail(cause);
		}
	}, [fail, pickPhoto, upload]);

	const send = useCallback(
		(body: string) => {
			createPost.mutate(
				{ body: body || undefined, mediaStorageId: attachment?.storageId ?? undefined },
				{ onSuccess: () => setAttachment(null), onError: fail },
			);
		},
		[attachment?.storageId, createPost, fail],
	);

	const like = useCallback(
		(post: ApiCommunityPost) =>
			toggle.mutate(
				{ postId: post.id, action: "like", on: !post.viewer.hasLiked },
				{ onError: fail },
			),
		[fail, toggle],
	);

	const sharePost = useCallback(
		(post: ApiCommunityPost) =>
			void shareLink(
				`${post.author.fullName} in ${community.name} on Instant Connect`,
				postLink(post.id),
			),
		[community.name],
	);

	const openThread = useCallback(
		(post: ApiCommunityPost) => router.push(`/communities/posts/${post.id}`),
		[],
	);

	const renderPost = useCallback(
		({ item }: { item: ApiCommunityPost }) => (
			<PostCard
				onLike={like}
				onMore={setActing}
				onOpenThread={openThread}
				onShare={sharePost}
				post={item}
			/>
		),
		[like, openThread, sharePost],
	);

	const header = (
		<View style={styles.header}>
			<View
				style={[
					styles.hero,
					{ paddingTop: insets.top + Spacing.two },
					!community.coverUrl && BrandGradient,
				]}
			>
				{community.coverUrl ? (
					<>
						<Image
							accessibilityIgnoresInvertColors
							contentFit="cover"
							source={{ uri: community.coverUrl }}
							style={StyleSheet.absoluteFill}
						/>
						<View style={[StyleSheet.absoluteFill, MediaScrim]} />
					</>
				) : null}

				<View style={styles.heroRow}>
					<RoundButton label="Go back" onPress={onBack} tone="glass">
						<ArrowLeftIcon color={Brand.onBrand} height={ICON} width={ICON} />
					</RoundButton>

					<View style={styles.heroCopy}>
						<Text accessibilityRole="header" numberOfLines={1} style={styles.heroTitle}>
							{community.name}
						</Text>

						<View style={styles.tagRow}>
							<View style={styles.tag}>
								<Text style={styles.tagLabel}>
									{community.isOfficial
										? "OFFICIAL"
										: (
												community.category?.label ??
												(community.isPublic ? "PUBLIC" : "PRIVATE")
											).toUpperCase()}
								</Text>
							</View>

							<Text numberOfLines={1} style={styles.heroMeta}>
								{community.isOfficial
									? "All users enrolled • Always active"
									: community.category
										? `${community.isPublic ? "Public" : "Private"} • ${memberCountLabel(community.memberCount)}`
										: memberCountLabel(community.memberCount)}
							</Text>
						</View>
					</View>

					{viewer.isAdmin && !community.isOfficial ? (
						<RoundButton
							label="Community settings"
							onPress={() => router.push(`/communities/${community.id}/settings`)}
							tone="glass"
						>
							<SettingsIcon color={Brand.onBrand} height={ICON} width={ICON} />
						</RoundButton>
					) : null}
				</View>
			</View>

			<View style={styles.identity}>
				<View style={[styles.logo, BrandGradient]}>
					{community.coverUrl && !community.isOfficial ? (
						<Image
							accessibilityIgnoresInvertColors
							contentFit="cover"
							source={{ uri: community.coverUrl }}
							style={StyleSheet.absoluteFill}
						/>
					) : (
						<Text style={styles.logoLabel}>{communityInitials(community.name)}</Text>
					)}
				</View>

				<Pressable
					accessibilityHint="Opens the member list"
					accessibilityLabel={`${memberCountLabel(community.memberCount)}. Members`}
					accessibilityRole="button"
					onPress={() => router.push(`/communities/${community.id}/members`)}
					style={({ pressed }) => [styles.membersRow, pressed && styles.pressed]}
				>
					<AvatarStack
						accessibilityLabel={memberCountLabel(community.memberCount)}
						extraCount={Math.max(
							0,
							community.memberCount - community.memberPreview.length,
						)}
						people={community.memberPreview}
					/>
					<Text style={styles.membersLink}>Members</Text>
				</Pressable>
			</View>

			<View style={styles.actionRow}>
				{canJoin ? (
					<ActionPill
						busy={join.isPending}
						label={
							viewer.isInvited && !community.isPublic
								? "Accept Invite"
								: "Join Community"
						}
						onPress={() => join.mutate(community.id, { onError: fail })}
						tone="solid"
					/>
				) : null}

				{viewer.isMember && viewer.canLeave ? (
					<ActionPill
						label="Joined"
						onPress={() => setConfirmLeave(true)}
						tone="outline"
					/>
				) : null}

				{canInvite ? (
					<ActionPill label="Add Member" onPress={() => setInviting(true)} tone="solid" />
				) : null}
			</View>

			{community.description ? (
				<Text style={styles.description}>{community.description}</Text>
			) : null}
		</View>
	);

	return (
		<View style={styles.screen}>
			<StatusBar style="light" />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.flex}
			>
				<FlatList
					ListEmptyComponent={
						feed.isPending ? (
							<StateMessage message="Loading posts…" />
						) : feed.isError ? (
							<StateMessage
								actionLabel="Try again"
								isError
								message={describeError(feed.error)}
								onPressAction={() => void feed.refetch()}
							/>
						) : (
							<StateMessage
								message={
									viewer.isMember
										? "No posts yet. Start the conversation."
										: "No posts yet. Join to start the conversation."
								}
							/>
						)
					}
					ListHeaderComponent={header}
					contentContainerStyle={styles.list}
					data={feed.data?.items ?? []}
					keyExtractor={(item) => item.id}
					keyboardShouldPersistTaps="handled"
					refreshControl={
						<RefreshControl
							onRefresh={() => {
								void detail.refetch();
								void feed.refetch();
							}}
							refreshing={feed.isRefetching || detail.isRefetching}
							tintColor={Brand.purple}
						/>
					}
					renderItem={renderPost}
					showsVerticalScrollIndicator={false}
					style={styles.flex}
				/>

				<View style={{ paddingBottom: insets.bottom + Spacing.two }}>
					{viewer.isMember ? (
						<PostComposer
							attachment={attachment}
							isSending={createPost.isPending}
							maxLength={POST_MAX}
							onAttach={() => void attach()}
							onRemoveAttachment={() => setAttachment(null)}
							onSend={send}
							placeholder="Write a post or ask a question..."
							viewer={
								profile.data
									? {
											fullName: profile.data.fullName,
											avatarUrl: profile.data.avatarUrl,
										}
									: null
							}
						/>
					) : (
						<Text style={styles.joinNote}>
							{canJoin
								? "Join this community to post and comment."
								: "This community is private."}
						</Text>
					)}
				</View>
			</KeyboardAvoidingView>

			<PostActions communityId={community.id} onClose={() => setActing(null)} post={acting} />

			<CommunityInviteSheet
				community={{ id: community.id, name: community.name }}
				onDismiss={() => setInviting(false)}
				visible={inviting}
			/>

			<ConfirmDialog
				cancelLabel="Stay"
				confirmLabel="Leave"
				message="You can join again later if it's public. Private communities need a new invite."
				onCancel={() => setConfirmLeave(false)}
				onConfirm={() => {
					setConfirmLeave(false);
					leave.mutate(community.id, { onError: fail });
				}}
				title={`Leave ${community.name}?`}
				visible={confirmLeave}
			/>

			{toast ? (
				<Toast message={toast.message} onDismiss={() => setToast(null)} tone={toast.tone} />
			) : null}
		</View>
	);
}

function RoundButton({
	label,
	onPress,
	tone,
	children,
}: {
	label: string;
	onPress: () => void;
	tone: "glass" | "light";
	children: React.ReactNode;
}) {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [
				styles.round,
				tone === "glass" ? styles.roundGlass : styles.roundLight,
				pressed && styles.pressed,
			]}
		>
			{children}
		</Pressable>
	);
}

function ActionPill({
	label,
	onPress,
	tone,
	busy = false,
}: {
	label: string;
	onPress: () => void;
	tone: "solid" | "outline";
	busy?: boolean;
}) {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="button"
			accessibilityState={{ busy, disabled: busy }}
			disabled={busy}
			hitSlop={Spacing.one}
			onPress={onPress}
			style={({ pressed }) => [
				styles.pill,
				tone === "solid" ? styles.pillSolid : styles.pillOutline,
				pressed && styles.pressed,
			]}
		>
			<Text style={[styles.pillLabel, tone === "outline" && styles.pillLabelOutline]}>
				{busy ? "Joining…" : label}
			</Text>
		</Pressable>
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
	stateColumn: {
		flex: 1,
		gap: Gap.card,
		padding: Spacing.three,
	},
	list: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		gap: Gap.card,
		paddingHorizontal: Spacing.three,
		paddingBottom: Spacing.four,
	},
	header: {
		gap: Gap.card,
		marginHorizontal: -Spacing.three,
		paddingBottom: Spacing.two,
	},
	hero: {
		minHeight: HERO_HEIGHT,
		paddingHorizontal: Spacing.three,
		paddingBottom: LOGO / 2 + Spacing.two,
		backgroundColor: Brand.purple,
		overflow: "hidden",
	},
	heroRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
	},
	heroCopy: {
		flex: 1,
		gap: Spacing.one,
	},
	heroTitle: {
		...Type.heroTitle,
		fontSize: 20,
		color: Brand.onBrand,
	},
	tagRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
	tag: {
		paddingHorizontal: Spacing.two,
		paddingVertical: Spacing.half,
		borderRadius: Spacing.one,
		backgroundColor: Ink.glassOnBrand,
	},
	tagLabel: {
		...Type.tagLabel,
		color: Brand.onBrand,
	},
	heroMeta: {
		...Type.resultMeta,
		flexShrink: 1,
		color: Ink.onBrandMuted,
	},
	identity: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: Gap.card,
		marginTop: -LOGO / 2 - Spacing.three,
		paddingHorizontal: Spacing.three,
	},
	logo: {
		width: LOGO,
		height: LOGO,
		borderRadius: Radius.media,
		borderWidth: 3,
		borderColor: Ink.surface,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		backgroundColor: Brand.purple,
	},
	logoLabel: {
		...Type.profileName,
		color: Brand.onBrand,
	},
	membersRow: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
		minHeight: MinTapTarget,
	},
	membersLink: {
		...Type.sectionLink,
		color: Brand.purple,
	},
	actionRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: Spacing.two,
		paddingHorizontal: Spacing.three,
	},
	description: {
		...Type.promoBody,
		color: Ink.meta,
		paddingHorizontal: Spacing.three,
	},
	round: {
		width: ROUND,
		height: ROUND,
		borderRadius: ROUND / 2,
		alignItems: "center",
		justifyContent: "center",
	},
	roundGlass: {
		backgroundColor: Ink.glassOnBrand,
		borderWidth: 1,
		borderColor: Ink.glassOnBrandBorder,
	},
	roundLight: {
		backgroundColor: Ink.glassOnLight,
	},
	pill: {
		minHeight: MinTapTarget - Spacing.two,
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.pill,
	},
	pillSolid: {
		backgroundColor: Brand.purple,
	},
	pillOutline: {
		borderWidth: 1,
		borderColor: Brand.purple,
	},
	pillLabel: {
		...Type.cardAction,
		fontSize: 14,
		color: Brand.onBrand,
	},
	pillLabelOutline: {
		color: Brand.purple,
	},
	joinNote: {
		...Type.resultMeta,
		color: Ink.meta,
		textAlign: "center",
		paddingTop: Spacing.three,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Ink.border,
	},
	pressed: {
		opacity: 0.75,
	},
});
