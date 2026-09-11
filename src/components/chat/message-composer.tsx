import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import AttachImageIcon from "@/assets/chat/attach-image.svg";
import SendIcon from "@/assets/chat/send.svg";
import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import { MAX_MESSAGE_LENGTH } from "@/features/chat/chat-service";

const BUTTON = 50;
const ICON = 24;

export type MessageComposerProps = {
	onSend: (body: string) => void;
	onAttachImage: () => void;
	isSending: boolean;
	onTyping: (isTyping: boolean) => void;
};

/**
 * The frame also has a voice note control. There is no model for a voice note
 * on the server and recording needs a native module the app does not carry, so
 * it is left out rather than shipped dead.
 */
/**
 * Silence for this long counts as having stopped, without needing a keystroke
 * to say so. Long enough that pausing to think does not flicker the other
 * party's indicator off and straight back on.
 */
const TYPING_IDLE_MS = 4000;

export function MessageComposer({
	onSend,
	onAttachImage,
	isSending,
	onTyping,
}: MessageComposerProps) {
	const [draft, setDraft] = useState("");
	const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isTypingRef = useRef(false);
	const body = draft.trim();
	const canSend = body.length > 0 && !isSending;

	/**
	 * One event per state change rather than one per keystroke: the socket only
	 * needs to know that typing started or stopped, and a message per character
	 * would be a burst of traffic saying the same thing.
	 */
	const announce = useCallback(
		(typing: boolean) => {
			if (isTypingRef.current === typing) return;

			isTypingRef.current = typing;
			onTyping(typing);
		},
		[onTyping],
	);

	const handleChange = useCallback(
		(next: string) => {
			setDraft(next);
			announce(next.trim().length > 0);

			if (idleTimer.current) clearTimeout(idleTimer.current);
			idleTimer.current = setTimeout(() => announce(false), TYPING_IDLE_MS);
		},
		[announce],
	);

	useEffect(
		() => () => {
			if (idleTimer.current) clearTimeout(idleTimer.current);
		},
		[],
	);

	const handleSend = useCallback(() => {
		if (!canSend) return;

		if (idleTimer.current) clearTimeout(idleTimer.current);
		announce(false);
		onSend(body);
		setDraft("");
	}, [announce, body, canSend, onSend]);

	return (
		<View style={styles.row}>
			<Pressable
				accessibilityHint="Choose a photo to send"
				accessibilityLabel="Attach a photo"
				accessibilityRole="button"
				accessibilityState={{ disabled: isSending }}
				disabled={isSending}
				onPress={onAttachImage}
				style={({ pressed }) => [styles.attach, pressed && styles.pressed]}
			>
				<AttachImageIcon color={Ink.meta} height={ICON} width={ICON} />
			</Pressable>

			<TextInput
				accessibilityLabel="Message"
				maxLength={MAX_MESSAGE_LENGTH}
				multiline
				onChangeText={handleChange}
				placeholder="Type a message..."
				placeholderTextColor={Ink.placeholder}
				style={styles.field}
				value={draft}
			/>

			<Pressable
				accessibilityHint="Sends this message"
				accessibilityLabel="Send"
				accessibilityRole="button"
				accessibilityState={{ disabled: !canSend }}
				disabled={!canSend}
				onPress={handleSend}
				style={({ pressed }) => [
					styles.send,
					!canSend && styles.sendDisabled,
					pressed && styles.pressed,
				]}
			>
				<SendIcon color={Brand.onBrand} height={ICON} width={ICON} />
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: Spacing.two,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
	},
	field: {
		flex: 1,
		minHeight: BUTTON,
		maxHeight: 120,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		paddingBottom: Spacing.two,
		borderRadius: Radius.sheet,
		backgroundColor: Ink.surface,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Ink.border,
		...Type.resultMeta,
		color: Ink.body,
	},
	attach: {
		width: BUTTON,
		height: BUTTON,
		minWidth: MinTapTarget,
		minHeight: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
	},
	send: {
		width: BUTTON,
		height: BUTTON,
		minWidth: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: BUTTON / 2,
		backgroundColor: Brand.purple,
	},
	sendDisabled: {
		opacity: 0.4,
	},
	pressed: {
		opacity: 0.7,
	},
});
