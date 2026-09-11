import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import {
	fetchNotifications,
	markAllNotificationsRead,
	markNotificationRead,
} from "@/features/notifications/notification-service";
import type { ApiNotificationPage } from "@/lib/api/notification-schema";

export const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotifications(): UseQueryResult<ApiNotificationPage> {
	return useQuery({
		queryKey: NOTIFICATIONS_KEY,
		queryFn: () => fetchNotifications(),
	});
}

/**
 * The bell only needs the count, and shares the list's cache entry so opening
 * Notifications does not refetch what Home already holds.
 */
export function useUnreadNotificationCount(): number {
	const query = useQuery({
		queryKey: NOTIFICATIONS_KEY,
		queryFn: () => fetchNotifications(),
	});

	return query.data?.unreadCount ?? 0;
}

export function useMarkNotificationRead() {
	const client = useQueryClient();

	const mutation = useMutation({
		mutationFn: markNotificationRead,
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
		},
	});

	return (id: string) => mutation.mutate(id);
}

export function useMarkAllNotificationsRead() {
	const client = useQueryClient();

	const mutation = useMutation({
		mutationFn: markAllNotificationsRead,
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
		},
	});

	return {
		markAllRead: () => mutation.mutate(),
		isClearing: mutation.isPending,
	};
}
