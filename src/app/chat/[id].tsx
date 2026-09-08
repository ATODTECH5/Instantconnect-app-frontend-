import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo } from "react";
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ArrowLeftIcon from "@/assets/auth/arrow-left.svg";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageComposer } from "@/components/chat/message-composer";
import { PresenceAvatar } from "@/components/ui/presence-avatar";
import { StateMessage } from "@/components/ui/state-message";
import { Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import {
	useConversationSummary,
	useMarkReadOnOpen,
	useMessages,
	useSendMessage,
} from "@/features/chat/use-thread";
import { describeError } from "@/lib/api/api-error";
import type { ApiMessage } from "@/lib/api/chat-schema";

const HEADER_AVATAR = 36;
const BACK_ICON = 20;

export default function ChatThreadScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const conversation = useConversationSummary(id);
	const messages = useMessages(id);
	const { send, isSending, isError: sendFailed } = useSendMessage(id);

	useMarkReadOnOpen(id, messages.isSuccess);

	const party = conversation?.party;
	const items = useMemo(() => messages.data?.items ?? [], [messages.data]);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/(tabs)/chat");
	}, []);

	/**
	 * The list is inverted so it opens on the newest message and grows upward,
	 * which is also the order the endpoint already returns. Index 0 therefore
	 * renders lowest, so the avatar belongs on the smallest index of a run: the
	 * bubble sitting at the bottom of that person's group, not the top of it.
	 */
	const renderMessage = useCallback(
		({ item, index }: { item: ApiMessage; index: number }) => (
			<MessageBubble
				message={item}
				partyAvatarUrl={party?.avatarUrl ?? null}
				partyName={party?.fullName ?? ""}
				showAvatar={index === 0 || items[index - 1].isMine !== item.isMine}
			/>
		),
		[items, party],
	);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.header}>
				<Pressable
					accessibilityLabel="Go back"
					accessibilityRole="button"
					onPress={goBack}
					style={({ pressed }) => [styles.back, pressed && styles.pressed]}
				>
					<ArrowLeftIcon color={Ink.title} height={BACK_ICON} width={BACK_ICON} />
				</Pressable>

				<PresenceAvatar
					fullName={party?.fullName ?? ""}
					isOnline={party?.isOnline ?? false}
					size={HEADER_AVATAR}
					uri={party?.avatarUrl ?? null}
				/>

				<View style={styles.identity}>
					<Text numberOfLines={1} style={styles.name}>
						{party?.fullName ?? "Conversation"}
					</Text>

					{party ? (
						<Text style={[styles.presence, party.isOnline && styles.presenceOnline]}>
							{party.isOnline ? "Online" : "Offline"}
						</Text>
					) : null}
				</View>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.body}
			>
				{messages.isPending ? (
					<View style={styles.padded}>
						<StateMessage message="Loading this conversation…" />
					</View>
				) : messages.isError ? (
					<View style={styles.padded}>
						<StateMessage
							actionLabel="Try again"
							isError
							message={describeError(messages.error)}
							onPressAction={() => void messages.refetch()}
						/>
					</View>
				) : items.length === 0 ? (
					<View style={styles.padded}>
						<StateMessage
							message={`No messages yet. Say hello to ${party?.fullName.split(" ")[0] ?? "them"}.`}
						/>
					</View>
				) : (
					<FlatList
						contentContainerStyle={styles.list}
						data={items}
						inverted
						keyExtractor={(item) => item.id}
						renderItem={renderMessage}
						showsVerticalScrollIndicator={false}
					/>
				)}

				{sendFailed ? (
					<Text role="alert" style={styles.sendError}>
						That message did not send. Check your connection and try again.
					</Text>
				) : null}

				<MessageComposer isSending={isSending} onSend={send} />
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
		paddingHorizontal: Spacing.three,
		paddingBottom: Spacing.two,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Ink.rowBorder,
	},
	back: {
		width: MinTapTarget,
		height: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Radius.pill,
		backgroundColor: Ink.glassOnLight,
	},
	identity: {
		flex: 1,
	},
	name: {
		...Type.resultName,
		color: Ink.title,
	},
	presence: {
		...Type.sliderTick,
		color: Ink.meta,
	},
	presenceOnline: {
		color: Ink.online,
	},
	body: {
		flex: 1,
	},
	list: {
		paddingVertical: Spacing.two,
	},
	padded: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
	},
	sendError: {
		...Type.sliderTick,
		color: Ink.danger,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.one,
	},
	pressed: {
		opacity: 0.7,
	},
});
