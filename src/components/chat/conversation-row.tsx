import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import CheckReadIcon from "@/assets/chat/check-read.svg";
import { PresenceAvatar } from "@/components/ui/presence-avatar";
import { Brand, Ink, MinTapTarget, Spacing, Type } from "@/constants/theme";
import { messageTime } from "@/features/chat/message-time";
import type { ApiConversation } from "@/lib/api/chat-schema";

const AVATAR = 52;
const BADGE = 16;
const TICK = 16;
const GAP = 14;

export type ConversationRowProps = {
	conversation: ApiConversation;
	onOpen: (id: string) => void;
};

/**
 * The right hand column is either a count or a read receipt, never both: an
 * unread thread has nothing of yours to have been read, and the frame shows the
 * tick only on rows whose badge is gone.
 */
export const ConversationRow = memo(function ConversationRow({
	conversation,
	onOpen,
}: ConversationRowProps) {
	const { party, lastMessage, unreadCount } = conversation;
	const preview = lastMessage?.text ?? "Say hello";
	const stamp = lastMessage ? messageTime(lastMessage.createdAt) : "";

	const spoken = [
		party.fullName,
		party.isOnline ? "online" : null,
		preview,
		unreadCount > 0
			? `${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`
			: null,
		stamp,
	]
		.filter(Boolean)
		.join(". ");

	return (
		<Pressable
			accessibilityHint="Opens this conversation"
			accessibilityLabel={spoken}
			accessibilityRole="button"
			onPress={() => onOpen(conversation.id)}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			<PresenceAvatar
				fullName={party.fullName}
				isOnline={party.isOnline}
				size={AVATAR}
				uri={party.avatarUrl}
			/>

			<View style={styles.copy}>
				<Text numberOfLines={1} style={styles.name}>
					{party.fullName}
				</Text>

				<Text
					numberOfLines={1}
					style={[styles.preview, !lastMessage && styles.previewEmpty]}
				>
					{preview}
				</Text>
			</View>

			<View style={styles.trailing}>
				<Text style={styles.stamp}>{stamp}</Text>

				{unreadCount > 0 ? (
					<View style={styles.badge}>
						<Text style={styles.badgeLabel}>{unreadCount}</Text>
					</View>
				) : lastMessage?.isMine ? (
					<CheckReadIcon color={Ink.placeholder} height={TICK} width={TICK} />
				) : null}
			</View>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: GAP,
		minHeight: MinTapTarget + Spacing.three,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
		backgroundColor: Ink.surface,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Ink.rowBorder,
	},
	copy: {
		flex: 1,
		gap: Spacing.one,
	},
	name: {
		...Type.resultName,
		color: Ink.title,
	},
	preview: {
		...Type.resultMeta,
		color: Ink.body,
	},
	/** A thread with no messages is a prompt, not content. */
	previewEmpty: {
		color: Ink.meta,
		fontStyle: "italic",
	},
	trailing: {
		alignItems: "flex-end",
		gap: Spacing.one,
	},
	stamp: {
		...Type.sliderTick,
		color: Ink.placeholder,
	},
	badge: {
		minWidth: BADGE,
		height: BADGE,
		paddingHorizontal: Spacing.half,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: BADGE / 2,
		backgroundColor: Brand.purple,
	},
	badgeLabel: {
		...Type.badgeLabel,
		color: Brand.onBrand,
	},
	pressed: {
		opacity: 0.7,
	},
});
