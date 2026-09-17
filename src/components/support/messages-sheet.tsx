import { useMemo } from "react";
import { FlatList, StyleSheet } from "react-native";

import { SupportMessageRow } from "@/components/support/support-message-row";
import { EmptyState } from "@/components/ui/empty-state";
import { StateMessage } from "@/components/ui/state-message";
import { TallSheet } from "@/components/ui/tall-sheet";
import { Spacing } from "@/constants/theme";
import { useSupportMessages } from "@/features/support/use-support";
import { describeError } from "@/lib/api/api-error";

export type MessagesSheetProps = {
	visible: boolean;
	onDismiss: () => void;
};

/** Messages (Figma 3101:2384 and 3101:1585): replies from the team, newest first. */
export function MessagesSheet({ visible, onDismiss }: MessagesSheetProps) {
	const messages = useSupportMessages();

	const replies = useMemo(
		() => (messages.data?.items ?? []).filter((message) => message.direction === "outbound"),
		[messages.data],
	);

	return (
		<TallSheet onDismiss={onDismiss} title="Messages" visible={visible}>
			{messages.isPending ? (
				<StateMessage message="Loading your messages…" />
			) : messages.isError ? (
				<StateMessage
					actionLabel="Try again"
					isError
					message={describeError(messages.error)}
					onPressAction={() => void messages.refetch()}
				/>
			) : replies.length === 0 ? (
				<EmptyState
					body="Messages from our team will be shown here"
					illustration={require("@/assets/support/empty-messages.png")}
					title="No messages"
				/>
			) : (
				<FlatList
					contentContainerStyle={styles.list}
					data={replies}
					keyExtractor={(message) => message.id}
					renderItem={({ item }) => <SupportMessageRow message={item} />}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</TallSheet>
	);
}

const styles = StyleSheet.create({
	list: {
		paddingBottom: Spacing.five,
	},
});
