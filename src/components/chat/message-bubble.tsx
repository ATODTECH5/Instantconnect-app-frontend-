import { Image, type ImageLoadEventData } from "expo-image";
import { memo, useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import CheckReadIcon from "@/assets/chat/check-read.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, Ink, Radius, Spacing, Type } from "@/constants/theme";
import { clockTime } from "@/features/chat/message-time";
import type { ApiMessage } from "@/lib/api/chat-schema";

const AVATAR = 36;
const TICK = 12;

/**
 * The bubble is capped as a share of the screen rather than a fixed width, so
 * an image reads the same on an SE and a Pro Max. The server stores at most
 * 1600px and serves a 900px derivative, so this only ever scales down.
 */
const IMAGE_WIDTH_RATIO = 0.62;

/**
 * Only until the image reports its own shape. The message carries no
 * dimensions, so the first paint has to guess; guessing 4:3 and correcting on
 * load is less jarring than collapsing to nothing and pushing the thread down.
 */
const FALLBACK_ASPECT = 4 / 3;

/** A very tall photo is bounded rather than allowed to fill the whole thread. */
const MIN_ASPECT = 0.6;

export type MessageBubbleProps = {
	message: ApiMessage;
	partyName: string;
	partyAvatarUrl: string | null;
	/** Hidden on a run of messages from the same person, as the frame shows. */
	showAvatar: boolean;
	/**
	 * How far the other party has read. Until this exists the tick can only
	 * honestly claim delivery, so it renders muted rather than confirming a
	 * read that may not have happened.
	 */
	partyLastReadAt: string | null;
	/** Absent while there is nowhere to open an image full screen. */
	onOpenImage?: (url: string) => void;
};

export const MessageBubble = memo(function MessageBubble({
	message,
	partyName,
	partyAvatarUrl,
	showAvatar,
	partyLastReadAt,
	onOpenImage,
}: MessageBubbleProps) {
	const { width } = useWindowDimensions();
	const [aspect, setAspect] = useState(FALLBACK_ASPECT);
	const imageWidth = Math.round(width * IMAGE_WIDTH_RATIO);

	/**
	 * `contain` would letterbox against the bubble's own background, so the box
	 * is resized to the image instead and the fit stays `cover`, which then
	 * crops nothing.
	 */
	const fitToImage = useCallback((event: ImageLoadEventData) => {
		const { width: w, height: h } = event.source;

		if (w > 0 && h > 0) setAspect(Math.max(w / h, MIN_ASPECT));
	}, []);
	const mine = message.isMine;
	const stamp = clockTime(message.createdAt);
	const seen =
		partyLastReadAt !== null &&
		new Date(message.createdAt) <= new Date(partyLastReadAt);

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
				{message.kind === "image" && message.mediaUrl !== null ? (
					<Pressable
						accessibilityHint={
							onOpenImage ? "Opens this photo" : undefined
						}
						accessibilityLabel={`Photo from ${mine ? "you" : partyName}`}
						accessibilityRole={onOpenImage ? "button" : "image"}
						disabled={!onOpenImage}
						onPress={() => onOpenImage?.(message.mediaUrl as string)}
					>
						<Image
							accessibilityIgnoresInvertColors
							contentFit="cover"
							onLoad={fitToImage}
							source={{ uri: message.mediaUrl }}
							style={[
								styles.image,
								{
									width: imageWidth,
									height: Math.round(imageWidth / aspect),
								},
							]}
							transition={150}
						/>
					</Pressable>
				) : (
					<View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
						<Text style={[styles.body, mine ? styles.bodyMine : styles.bodyTheirs]}>
							{message.body}
						</Text>
					</View>
				)}

				<View style={styles.meta}>
					<Text style={styles.stamp}>{stamp}</Text>

					{/* Only your own message has a delivery state worth reporting. */}
					{mine ? (
						<CheckReadIcon
							color={seen ? Brand.purple : Ink.placeholder}
							height={TICK}
							width={TICK}
						/>
					) : null}
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
	image: {
		borderRadius: Radius.sheet,
		backgroundColor: Ink.border,
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
