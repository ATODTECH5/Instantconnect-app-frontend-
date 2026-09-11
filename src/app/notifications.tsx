import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NotificationRow } from "@/components/notifications/notification-row";
import { ScreenHeader } from "@/components/nav/screen-header";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import {
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
	useNotifications,
} from "@/features/notifications/use-notifications";
import { describeError } from "@/lib/api/api-error";
import type { ApiNotification } from "@/lib/api/notification-schema";

export default function NotificationsScreen() {
	const notifications = useNotifications();
	const markRead = useMarkNotificationRead();
	const { markAllRead, isClearing } = useMarkAllNotificationsRead();

	const items = notifications.data?.items ?? [];
	const unreadCount = notifications.data?.unreadCount ?? 0;

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/(tabs)");
	}, []);

	/**
	 * Reading and opening are the same gesture. A connection notification has
	 * nowhere of its own to go, so it lands on the Connection tab; a message
	 * opens the thread it belongs to.
	 */
	const open = useCallback(
		(notification: ApiNotification) => {
			if (!notification.isRead) markRead(notification.id);

			if (notification.kind === "message" && notification.subjectId) {
				router.push(`/chat/${notification.subjectId}`);
				return;
			}

			router.push("/(tabs)/connection");
		},
		[markRead],
	);

	const renderItem = useCallback(
		({ item }: { item: ApiNotification }) => (
			<NotificationRow notification={item} onPress={open} />
		),
		[open],
	);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.header}>
				<ScreenHeader
					onBack={goBack}
					title="Notifications"
					trailing={
						unreadCount > 0 ? (
							<Pressable
								accessibilityHint="Marks every notification as read"
								accessibilityLabel="Mark all read"
								accessibilityRole="button"
								accessibilityState={{ disabled: isClearing }}
								disabled={isClearing}
								onPress={markAllRead}
								style={({ pressed }) => [pressed && styles.pressed]}
							>
								<Text style={styles.clear}>Mark all</Text>
							</Pressable>
						) : null
					}
				/>
			</View>

			{notifications.isPending ? (
				<View style={styles.padded}>
					<StateMessage message="Loading your notifications…" />
				</View>
			) : notifications.isError ? (
				<View style={styles.padded}>
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(notifications.error)}
						onPressAction={() => void notifications.refetch()}
					/>
				</View>
			) : items.length === 0 ? (
				<View style={styles.padded}>
					<StateMessage message="Nothing yet. Messages and connection requests will show up here." />
				</View>
			) : (
				<FlatList
					contentContainerStyle={styles.list}
					data={items}
					keyExtractor={(item) => item.id}
					onRefresh={() => void notifications.refetch()}
					refreshing={notifications.isFetching}
					renderItem={renderItem}
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
	header: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		paddingBottom: Spacing.two,
	},
	list: {
		gap: Spacing.one,
		paddingHorizontal: Spacing.three,
		paddingBottom: Spacing.six,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
	},
	padded: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: Spacing.four,
	},
	clear: {
		...Type.sectionLink,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
