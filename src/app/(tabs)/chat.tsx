import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConversationRow } from "@/components/chat/conversation-row";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { SearchField } from "@/components/ui/search-field";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import type { ConversationFilter } from "@/features/chat/chat-service";
import { useConversations } from "@/features/chat/use-conversations";
import { useNavBarInset } from "@/hooks/use-nav-bar-inset";
import { describeError } from "@/lib/api/api-error";
import type { ApiConversation } from "@/lib/api/chat-schema";

const EDGE_INSET = Spacing.three;

const EMPTY_BY_FILTER: Record<ConversationFilter, string> = {
	all: "Connect with someone and your conversations will appear here.",
	unread: "Nothing unread. You are all caught up.",
	favourites: "Favourite a conversation and it will be listed here.",
};

export default function ChatScreen() {
	const navInset = useNavBarInset();
	const [filter, setFilter] = useState<ConversationFilter>("all");
	const [term, setTerm] = useState("");

	const conversations = useConversations(filter);

	const unreadThreads = conversations.data?.unreadThreads ?? 0;
	const favourites = useConversations("favourites");
	const favouriteCount = favourites.data?.page.total ?? 0;

	/**
	 * The frame puts a count on the Unread and Favourites chips. Both come from
	 * the server rather than from the page in hand, since a page is capped and
	 * the count is of the whole set.
	 */
	const tabs: ChipOption[] = useMemo(
		() => [
			{ id: "all", label: "All" },
			{
				id: "unread",
				label: unreadThreads > 0 ? `Unread ${unreadThreads}` : "Unread",
			},
			{
				id: "favourites",
				label: favouriteCount > 0 ? `Favourites ${favouriteCount}` : "Favourites",
			},
		],
		[unreadThreads, favouriteCount],
	);

	/**
	 * Filtering in memory is right here and wrong on the chips: the chips narrow
	 * the whole set server side, while search only ever refines the page the
	 * user is already looking at, which is what the frame's field does.
	 */
	const visible = useMemo(() => {
		const items = conversations.data?.items ?? [];
		const needle = term.trim().toLowerCase();

		if (!needle) return items;

		return items.filter(
			(item) =>
				item.party.fullName.toLowerCase().includes(needle) ||
				(item.lastMessage?.text ?? "").toLowerCase().includes(needle),
		);
	}, [conversations.data, term]);

	/**
	 * Tracked here rather than read off `isFetching`, which is also true for the
	 * background refetch that follows sending a message, and would spin the
	 * control on its own without anybody having pulled it.
	 */
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);

		try {
			await conversations.refetch();
		} finally {
			setIsRefreshing(false);
		}
	}, [conversations]);

	const openThread = useCallback((id: string) => {
		router.push(`/chat/${id}`);
	}, []);

	const renderRow = useCallback(
		({ item }: { item: ApiConversation }) => (
			<ConversationRow conversation={item} onOpen={openThread} />
		),
		[openThread],
	);

	return (
		<SafeAreaView edges={["top"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<Text accessibilityRole="header" style={styles.title}>
					Chats
				</Text>

				<SearchField
					accessibilityLabel="Search your conversations"
					onChangeText={setTerm}
					onSubmit={() => {}}
					placeholder="Search..."
					value={term}
				/>

				<ChipGroup
					accessibilityLabel="Filter conversations"
					onSelect={(id) => setFilter(id as ConversationFilter)}
					options={tabs}
					selectedId={filter}
				/>
			</View>

			{conversations.isPending ? (
				<View style={styles.padded}>
					<StateMessage message="Loading your conversations…" />
				</View>
			) : conversations.isError ? (
				<View style={styles.padded}>
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(conversations.error)}
						onPressAction={() => void conversations.refetch()}
					/>
				</View>
			) : visible.length === 0 ? (
				<View style={styles.padded}>
					<StateMessage
						message={
							term.trim()
								? `No conversation matches “${term.trim()}”.`
								: EMPTY_BY_FILTER[filter]
						}
					/>
				</View>
			) : (
				<FlatList
					contentContainerStyle={{ paddingBottom: navInset + Spacing.four }}
					data={visible}
					keyExtractor={(item) => item.id}
					onRefresh={() => void handleRefresh()}
					refreshing={isRefreshing}
					renderItem={renderRow}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	column: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	title: {
		...Type.screenTitle,
		color: Ink.title,
	},
	padded: {
		paddingHorizontal: EDGE_INSET,
		paddingTop: Spacing.four,
	},
});
