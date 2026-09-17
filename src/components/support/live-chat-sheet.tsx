import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import SendIcon from "@/assets/chat/send.svg";
import { MessageBubble } from "@/components/chat/message-bubble";
import { AvatarImage } from "@/components/ui/avatar-image";
import { StateMessage } from "@/components/ui/state-message";
import { TallSheet } from "@/components/ui/tall-sheet";
import { Toast } from "@/components/ui/toast";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import { SUPPORT_TEAM_NAME } from "@/features/support/contacts";
import { MAX_SUPPORT_MESSAGE_LENGTH } from "@/features/support/support-service";
import { useSendSupportMessage, useSupportMessages } from "@/features/support/use-support";
import { describeError } from "@/lib/api/api-error";
import type { ApiMessage } from "@/lib/api/chat-schema";
import type { ApiSupportMessage } from "@/lib/api/support-schema";

const AVATAR = 28;
const BUTTON = 50;
const ICON = 24;

export type LiveChatSheetProps = {
	visible: boolean;
	firstName: string;
	onDismiss: () => void;
};

/** The thread reuses the chat bubble, which reads the chat message shape. */
function toBubble(message: ApiSupportMessage): ApiMessage {
	return {
		id: message.id,
		kind: "text",
		body: message.body,
		mediaUrl: null,
		isMine: message.direction === "inbound",
		createdAt: message.createdAt,
	};
}

/**
 * Live Chat (Figma 3101:1775). Honest about what is behind it: messages are
 * stored on the account's support thread and a reply from the team shows up
 * here and under Messages, but nobody is typing back in real time yet.
 */
export function LiveChatSheet({ visible, firstName, onDismiss }: LiveChatSheetProps) {
	const messages = useSupportMessages();
	const send = useSendSupportMessage();
	const [draft, setDraft] = useState("");
	const [error, setError] = useState<string | null>(null);

	const thread = useMemo(() => (messages.data?.items ?? []).map(toBubble), [messages.data]);
	const body = draft.trim();
	const canSend = body.length > 0 && !send.isPending;

	const handleSend = useCallback(() => {
		if (!canSend) return;

		setError(null);
		send.mutate(body, {
			onSuccess: () => setDraft(""),
			onError: (cause) => setError(describeError(cause)),
		});
	}, [body, canSend, send]);

	const renderItem = useCallback(
		({ item, index }: { item: ApiMessage; index: number }) => {
			// Inverted list: the next index is the older neighbour.
			const older = thread[index + 1];

			return (
				<MessageBubble
					message={item}
					partyAvatarUrl={null}
					partyLastReadAt={null}
					partyName={SUPPORT_TEAM_NAME}
					showAvatar={!older || older.isMine !== item.isMine}
				/>
			);
		},
		[thread],
	);

	return (
		<TallSheet
			accessibilityLabel="Live chat with support"
			header={
				<View style={styles.header}>
					<AvatarImage fullName={SUPPORT_TEAM_NAME} size={AVATAR} uri={null} />
					<Text accessibilityRole="header" style={styles.title}>
						{SUPPORT_TEAM_NAME}
					</Text>
				</View>
			}
			onDismiss={onDismiss}
			title="Live Chat"
			visible={visible}
		>
			{error ? (
				<Toast message={error} onDismiss={() => setError(null)} tone="error" />
			) : null}

			{messages.isPending ? (
				<StateMessage message="Opening your conversation…" />
			) : messages.isError ? (
				<StateMessage
					actionLabel="Try again"
					isError
					message={describeError(messages.error)}
					onPressAction={() => void messages.refetch()}
				/>
			) : (
				<FlatList
					ListFooterComponent={
						<Text style={styles.welcome}>
							Hi {firstName} 👋 Welcome to {SUPPORT_TEAM_NAME} Support.{"\n"}How can we
							help you today?
						</Text>
					}
					contentContainerStyle={styles.thread}
					data={thread}
					inverted
					keyExtractor={(message) => message.id}
					keyboardShouldPersistTaps="handled"
					renderItem={renderItem}
					showsVerticalScrollIndicator={false}
				/>
			)}

			<View style={styles.composer}>
				<TextInput
					accessibilityLabel="Message"
					maxLength={MAX_SUPPORT_MESSAGE_LENGTH}
					multiline
					onChangeText={setDraft}
					placeholder="Type a message..."
					placeholderTextColor={Ink.placeholder}
					style={styles.field}
					value={draft}
				/>

				<Pressable
					accessibilityHint="Sends this message to support"
					accessibilityLabel="Send"
					accessibilityRole="button"
					accessibilityState={{ disabled: !canSend, busy: send.isPending }}
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
		</TallSheet>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
	},
	title: {
		...Type.subtitle,
		color: Ink.title,
	},
	thread: {
		flexGrow: 1,
		justifyContent: "flex-end",
		paddingBottom: Spacing.two,
	},
	welcome: {
		...Type.resultMeta,
		color: Ink.muted,
		textAlign: "center",
		paddingHorizontal: Spacing.three,
		paddingBottom: Spacing.three,
	},
	composer: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: Spacing.two,
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
