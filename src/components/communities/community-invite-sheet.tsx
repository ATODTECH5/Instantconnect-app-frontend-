import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import LinkIcon from "@/assets/referrals/link.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SearchField } from "@/components/ui/search-field";
import { StateMessage } from "@/components/ui/state-message";
import { TallSheet } from "@/components/ui/tall-sheet";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import { communityLink } from "@/features/communities/community-links";
import { copyToClipboard } from "@/utils/clipboard";
import { useInvitable, useInviteToCommunity } from "@/features/communities/use-communities";
import { describeError } from "@/lib/api/api-error";
import type { ApiInvitableConnectionPage } from "@/lib/api/community-schema";

const AVATAR = 44;
const ICON = 18;

type Invitable = ApiInvitableConnectionPage["items"][number];

export type CommunityInviteSheetProps = {
	visible: boolean;
	community: { id: string; name: string };
	onDismiss: () => void;
};

/**
 * Invites go out one tap at a time, so each row shows the server's answer:
 * Invite, Invited, or Member. Only accepted connections are listed. The
 * design's "From contacts" section needs the phone's contacts permission and
 * is left out.
 */
export function CommunityInviteSheet({ visible, community, onDismiss }: CommunityInviteSheetProps) {
	const [query, setQuery] = useState("");
	const invitable = useInvitable(community.id, query.trim(), visible);
	const invite = useInviteToCommunity(community.id);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const send = (person: Invitable) => {
		setPendingId(person.id);
		setError(null);
		invite.mutate([person.id], {
			onError: (cause) => setError(describeError(cause)),
			onSettled: () => setPendingId(null),
		});
	};

	return (
		<TallSheet onDismiss={onDismiss} title="Invite people" visible={visible}>
			<View style={styles.body}>
				<View style={styles.shareCard}>
					<View style={styles.linkBadge}>
						<LinkIcon color={Brand.purple} height={ICON} width={ICON} />
					</View>

					<View style={styles.shareCopy}>
						<Text style={styles.shareTitle}>Share Community Link</Text>
						<Text numberOfLines={1} style={styles.shareMeta}>
							{community.name}
						</Text>
					</View>

					<Pressable
						accessibilityHint="Copies the community link"
						accessibilityLabel="Copy community link"
						accessibilityRole="button"
						hitSlop={Spacing.two}
						onPress={() => {
							copyToClipboard(communityLink(community.id));
							setCopied(true);
						}}
						style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
					>
						<Text style={styles.shareButtonLabel}>{copied ? "Copied" : "Copy"}</Text>
					</Pressable>
				</View>

				<SearchField
					accessibilityLabel="Search your connections by name or username"
					onChangeText={setQuery}
					onSubmit={() => undefined}
					placeholder="Search by name or username..."
					value={query}
				/>

				{error ? <Text style={styles.error}>{error}</Text> : null}

				<Text accessibilityRole="header" style={styles.sectionTitle}>
					FROM YOUR CONNECTIONS
				</Text>

				{invitable.isPending ? (
					<StateMessage message="Loading your connections…" />
				) : invitable.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(invitable.error)}
						onPressAction={() => void invitable.refetch()}
					/>
				) : (
					<FlatList
						ListEmptyComponent={
							<StateMessage
								message={
									query.trim()
										? "No connections match that name."
										: "Connect with people first, then you can invite them."
								}
							/>
						}
						data={invitable.data.items}
						keyExtractor={(item) => item.id}
						keyboardShouldPersistTaps="handled"
						renderItem={({ item }) => (
							<InviteRow
								isSending={pendingId === item.id}
								onInvite={send}
								person={item}
							/>
						)}
						style={styles.list}
					/>
				)}

				<PrimaryButton label="Done" onPress={onDismiss} />
			</View>
		</TallSheet>
	);
}

function InviteRow({
	person,
	isSending,
	onInvite,
}: {
	person: Invitable;
	isSending: boolean;
	onInvite: (person: Invitable) => void;
}) {
	const canInvite = person.state === "none";
	const label =
		person.state === "member" ? "Member" : person.state === "invited" ? "Invited" : "Invite";

	return (
		<View style={styles.row}>
			<AvatarImage fullName={person.fullName} size={AVATAR} uri={person.avatarUrl} />

			<View style={styles.rowCopy}>
				<Text numberOfLines={1} style={styles.name}>
					{person.fullName}
				</Text>

				{person.username ? (
					<Text numberOfLines={1} style={styles.meta}>
						@{person.username}
					</Text>
				) : null}
			</View>

			<Pressable
				accessibilityLabel={
					canInvite ? `Invite ${person.fullName}` : `${person.fullName}, ${label}`
				}
				accessibilityRole="button"
				accessibilityState={{ disabled: !canInvite || isSending, busy: isSending }}
				disabled={!canInvite || isSending}
				hitSlop={Spacing.two}
				onPress={() => onInvite(person)}
				style={({ pressed }) => [
					styles.invite,
					canInvite ? styles.inviteOpen : styles.inviteDone,
					pressed && styles.pressed,
				]}
			>
				{isSending ? (
					<ActivityIndicator color={Brand.purple} size="small" />
				) : (
					<Text style={[styles.inviteLabel, !canInvite && styles.inviteLabelDone]}>
						{label}
					</Text>
				)}
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	body: {
		flex: 1,
		gap: Gap.card,
		paddingBottom: Spacing.three,
	},
	shareCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		padding: Gap.card,
		borderRadius: Radius.media,
		borderWidth: 1,
		borderColor: Brand.purpleTint,
		backgroundColor: Brand.purpleSurface,
	},
	linkBadge: {
		width: 36,
		height: 36,
		borderRadius: Radius.control,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surface,
	},
	shareCopy: {
		flex: 1,
		gap: Spacing.half,
	},
	shareTitle: {
		...Type.promoTitle,
		color: Brand.purple,
	},
	shareMeta: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	shareButton: {
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purple,
	},
	shareButtonLabel: {
		...Type.cardAction,
		color: Brand.onBrand,
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
	},
	sectionTitle: {
		...Type.overline,
		color: Ink.meta,
	},
	list: {
		flex: 1,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		paddingVertical: Gap.snug,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Ink.border,
	},
	rowCopy: {
		flex: 1,
		gap: Spacing.half,
	},
	name: {
		...Type.resultName,
		color: Ink.title,
	},
	meta: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	invite: {
		minWidth: 76,
		minHeight: MinTapTarget - Spacing.three,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.pill,
	},
	inviteOpen: {
		borderWidth: 1,
		borderColor: Brand.purple,
	},
	inviteDone: {
		backgroundColor: Ink.bubbleIncoming,
	},
	inviteLabel: {
		...Type.cardAction,
		color: Brand.purple,
	},
	inviteLabelDone: {
		color: Ink.meta,
	},
	pressed: {
		opacity: 0.7,
	},
});
