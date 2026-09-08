import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import CheckReadIcon from "@/assets/chat/check-read.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, Ink, Radius, Spacing, Type } from "@/constants/theme";
import { clockTime } from "@/features/chat/message-time";
import type { ApiMessage } from "@/lib/api/chat-schema";

const AVATAR = 36;
const TICK = 12;

export type MessageBubbleProps = {
	message: ApiMessage;
	partyName: string;
	partyAvatarUrl: string | null;
	/** Hidden on a run of messages from the same person, as the frame shows. */
	showAvatar: boolean;
};

export const MessageBubble = memo(function MessageBubble({
	message,
	partyName,
	partyAvatarUrl,
	showAvatar,
}: MessageBubbleProps) {
	const mine = message.isMine;
	const stamp = clockTime(message.createdAt);

	return (
		<View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
			{!mine ? (
				<View style={styles.gutter}>
					{showAvatar ? (
						<AvatarImage fullName={partyName} size={AVATAR} uri={partyAvatarUrl} />
					) : null}
				</View>
			) : null}

			<View style={[styles.stack, mine ? styles.stackMine : styles.stackTheirs]}>
				<View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
					<Text style={[styles.body, mine ? styles.bodyMine : styles.bodyTheirs]}>
						{message.body}
					</Text>
				</View>

				<View style={styles.meta}>
					<Text style={styles.stamp}>{stamp}</Text>

					{/* Only your own message can report having been delivered. */}
					{mine ? <CheckReadIcon color={Ink.stamp} height={TICK} width={TICK} /> : null}
				</View>
			</View>
		</View>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: Spacing.two,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.one,
	},
	rowMine: {
		justifyContent: "flex-end",
	},
	rowTheirs: {
		justifyContent: "flex-start",
	},
	/** Reserves the avatar column so a run of bubbles stays aligned. */
	gutter: {
		width: AVATAR,
	},
	stack: {
		maxWidth: "76%",
		gap: Spacing.half,
	},
	stackMine: {
		alignItems: "flex-end",
	},
	stackTheirs: {
		alignItems: "flex-start",
	},
	bubble: {
		paddingHorizontal: Spacing.two,
		paddingVertical: Spacing.two,
		borderRadius: Radius.bubble,
	},
	/** The corner nearest the sender stays square, which is the frame's tail. */
	bubbleMine: {
		backgroundColor: Brand.purple,
		borderBottomRightRadius: 0,
	},
	bubbleTheirs: {
		backgroundColor: Ink.bubbleIncoming,
		borderBottomLeftRadius: 0,
	},
	body: {
		...Type.resultMeta,
	},
	bodyMine: {
		color: Brand.onBrand,
	},
	bodyTheirs: {
		color: Ink.body,
	},
	meta: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.half,
	},
	stamp: {
		...Type.sliderTick,
		color: Ink.stamp,
	},
});
