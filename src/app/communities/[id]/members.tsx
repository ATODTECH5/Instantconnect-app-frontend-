import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MoreIcon from "@/assets/communities/more.svg";
import TrashIcon from "@/assets/profile/trash.svg";
import ShieldIcon from "@/assets/settings/shield.svg";
import LogoutIcon from "@/assets/profile/logout.svg";
import { CommunityInviteSheet } from "@/components/communities/community-invite-sheet";
import { HeaderPill } from "@/components/communities/header-pill";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ActionSheet, type ActionSheetItem } from "@/components/ui/action-sheet";
import { AvatarImage } from "@/components/ui/avatar-image";
import { SearchField } from "@/components/ui/search-field";
import { StateMessage } from "@/components/ui/state-message";
import { Toast } from "@/components/ui/toast";
import { Brand, Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { formatCompactCount, formatShortDate } from "@/utils/format";
import {
	useCommunity,
	useCommunityMembers,
	useLeaveCommunity,
	useRemoveMember,
	useSetMemberAdmin,
} from "@/features/communities/use-communities";
import { useProfile } from "@/features/profile/use-profile";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { describeError } from "@/lib/api/api-error";
import type { ApiCommunityMember } from "@/lib/api/community-schema";

const AVATAR = 44;
const ICON = 20;

export default function CommunityMembersScreen() {
	const { id = "" } = useLocalSearchParams<{ id: string }>();
	const [query, setQuery] = useState("");
	const search = useDebouncedValue(query.trim());
	const community = useCommunity(id);
	const members = useCommunityMembers(id, search);
	const profile = useProfile();
	const setAdmin = useSetMemberAdmin(id);
	const remove = useRemoveMember(id);
	const leave = useLeaveCommunity();

	const [acting, setActing] = useState<ApiCommunityMember | null>(null);
	const [inviting, setInviting] = useState(false);
	const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace(`/communities/${id}`);
	}, [id]);

	const viewerId = profile.data?.id;
	const viewer = community.data?.viewer;
	const isOfficial = community.data?.isOfficial ?? false;
	const canInvite =
		!isOfficial &&
		Boolean(viewer && (viewer.isAdmin || (viewer.isMember && community.data?.isPublic)));
	const fail = useCallback(
		(cause: unknown) => setToast({ message: describeError(cause), tone: "error" }),
		[],
	);

	const items: ActionSheetItem[] = acting
		? acting.id === viewerId
			? viewer?.canLeave
				? [
						{
							key: "leave",
							label: "Leave Community",
							Icon: LogoutIcon,
							destructive: true,
							onPress: () => {
								setActing(null);
								leave.mutate(id, {
									onSuccess: () => router.replace("/communities"),
									onError: fail,
								});
							},
						},
					]
				: []
			: viewer?.isAdmin && !isOfficial
				? [
						{
							key: "admin",
							label: acting.isAdmin ? "Remove as Admin" : "Make Admin",
							Icon: ShieldIcon,
							onPress: () => {
								const target = acting;

								setActing(null);
								setAdmin.mutate(
									{ userId: target.id, isAdmin: !target.isAdmin },
									{ onError: fail },
								);
							},
						},
						{
							key: "remove",
							label: "Remove from Community",
							Icon: TrashIcon,
							destructive: true,
							onPress: () => {
								const target = acting;

								setActing(null);
								remove.mutate(target.id, {
									onSuccess: () =>
										setToast({
											message: `${target.fullName} was removed.`,
											tone: "success",
										}),
									onError: fail,
								});
							},
						},
					]
				: []
		: [];

	const renderMember = useCallback(
		({ item }: { item: ApiCommunityMember }) => (
			<MemberRow
				hasActions={
					item.id === viewerId
						? Boolean(viewer?.canLeave)
						: Boolean(viewer?.isAdmin && !isOfficial)
				}
				member={item}
				onMore={setActing}
			/>
		),
		[isOfficial, viewer?.canLeave, viewer?.isAdmin, viewerId],
	);

	const total = members.data?.page.total ?? community.data?.memberCount ?? 0;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader
					onBack={goBack}
					title="Members"
					trailing={
						canInvite ? (
							<HeaderPill
								accessibilityHint="Opens your connections to invite them"
								label="Invite"
								onPress={() => setInviting(true)}
							/>
						) : undefined
					}
				/>

				<SearchField
					accessibilityLabel="Search members by name or username"
					onChangeText={setQuery}
					onSubmit={() => undefined}
					placeholder={`Search ${formatCompactCount(total)} members...`}
					value={query}
				/>

				{members.isPending ? (
					<StateMessage message="Loading members…" />
				) : members.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(members.error)}
						onPressAction={() => void members.refetch()}
					/>
				) : (
					<FlatList
						ListEmptyComponent={
							<StateMessage
								message={search ? "No members match that name." : "No members yet."}
							/>
						}
						contentContainerStyle={styles.list}
						data={members.data.items}
						keyExtractor={(item) => item.id}
						refreshControl={
							<RefreshControl
								onRefresh={() => void members.refetch()}
								refreshing={members.isRefetching}
								tintColor={Brand.purple}
							/>
						}
						renderItem={renderMember}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>

			<ActionSheet
				items={items}
				onDismiss={() => setActing(null)}
				visible={acting !== null && items.length > 0}
			/>

			{community.data ? (
				<CommunityInviteSheet
					community={{ id: community.data.id, name: community.data.name }}
					onDismiss={() => setInviting(false)}
					visible={inviting}
				/>
			) : null}

			{toast ? (
				<Toast message={toast.message} onDismiss={() => setToast(null)} tone={toast.tone} />
			) : null}
		</SafeAreaView>
	);
}

const MemberRow = memo(function MemberRow({
	member,
	hasActions,
	onMore,
}: {
	member: ApiCommunityMember;
	hasActions: boolean;
	onMore: (member: ApiCommunityMember) => void;
}) {
	const meta = [
		member.username ? `@${member.username}` : null,
		`Joined ${formatShortDate(new Date(member.joinedAt))}`,
	]
		.filter(Boolean)
		.join(" • ");

	return (
		<View style={styles.row}>
			<AvatarImage fullName={member.fullName} size={AVATAR} uri={member.avatarUrl} />

			<View style={styles.copy}>
				<View style={styles.nameRow}>
					<Text numberOfLines={1} style={styles.name}>
						{member.fullName}
					</Text>

					{member.isAdmin ? (
						<View style={styles.adminTag}>
							<Text style={styles.adminLabel}>ADMIN</Text>
						</View>
					) : null}
				</View>

				<Text numberOfLines={1} style={styles.meta}>
					{meta}
				</Text>
			</View>

			{hasActions ? (
				<Pressable
					accessibilityLabel={`Actions for ${member.fullName}`}
					accessibilityRole="button"
					hitSlop={Spacing.three}
					onPress={() => onMore(member)}
				>
					<MoreIcon color={Ink.meta} height={ICON} width={ICON} />
				</Pressable>
			) : null}
		</View>
	);
});

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
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
		paddingBottom: Spacing.five,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		paddingVertical: Gap.card,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Ink.border,
	},
	copy: {
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
	meta: {
		...Type.cardMeta,
		color: Ink.meta,
	},
});
