import { useCallback, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import SendIcon from "@/assets/chat/send.svg";
import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import { MAX_MESSAGE_LENGTH } from "@/features/chat/chat-service";

const BUTTON = 50;
const ICON = 24;

export type MessageComposerProps = {
	onSend: (body: string) => void;
	isSending: boolean;
};

/**
 * The frame also has an attach button and a voice note control. Neither is
 * built: `POST /conversations/:id/messages` takes text only, and there is no
 * model for a voice note at all. They arrive with media messages rather than
 * sitting here doing nothing.
 */
export function MessageComposer({ onSend, isSending }: MessageComposerProps) {
	const [draft, setDraft] = useState("");
	const body = draft.trim();
	const canSend = body.length > 0 && !isSending;

	const handleSend = useCallback(() => {
		if (!canSend) return;

		onSend(body);
		setDraft("");
	}, [body, canSend, onSend]);

	return (
		<View style={styles.row}>
			<TextInput
				accessibilityLabel="Message"
				maxLength={MAX_MESSAGE_LENGTH}
				multiline
				onChangeText={setDraft}
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
