import * as Notifications from "expo-notifications";
import { router, usePathname } from "expo-router";
import { useEffect } from "react";

import { notificationRoute } from "@/features/notifications/notification-route";
import {
	registerForPush,
	setCurrentPath,
	type PushData,
} from "@/features/notifications/push-service";
import {
	useMarkNotificationRead,
	useUnreadNotificationCount,
} from "@/features/notifications/use-notifications";

/**
 * Everything push needs while someone is signed in. Mounted beside the
 * notification socket in the tabs layout, which only renders for a signed in
 * account, so registering here can never race the session.
 *
 * - registers this install for the account
 * - opens what a tapped push is about, including the tap that launched the app
 * - keeps the app icon's badge equal to the bell
 */
export function usePushNotifications(): void {
	const pathname = usePathname();
	const markRead = useMarkNotificationRead();
	const unreadCount = useUnreadNotificationCount();
	const response = Notifications.useLastNotificationResponse();

	useEffect(() => {
		void registerForPush();
	}, []);

	useEffect(() => {
		setCurrentPath(pathname);
	}, [pathname]);

	useEffect(() => {
		void Notifications.setBadgeCountAsync(unreadCount).catch(() => undefined);
	}, [unreadCount]);

	/**
	 * Covers a tap while the app is running and the tap that cold started it,
	 * which is why it reads the last response rather than only listening.
	 * Cleared once handled, or every remount of the tabs would open it again.
	 */
	useEffect(() => {
		if (!response) return;
		if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

		const data = response.notification.request.content.data as PushData;

		Notifications.clearLastNotificationResponse();

		if (data.notificationId) markRead(data.notificationId);
		if (data.kind) router.push(notificationRoute(data.kind, data.subjectId ?? null));
	}, [markRead, response]);
}
