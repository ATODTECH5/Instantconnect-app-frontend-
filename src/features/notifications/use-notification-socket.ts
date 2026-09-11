import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";

import {
	NOTIFICATION_CREATED,
	getChatSocket,
} from "@/features/chat/chat-socket";
import { NOTIFICATIONS_KEY } from "@/features/notifications/use-notifications";
import { getAccessToken, subscribeToSession } from "@/lib/api/session-store";

function useSocketReady(): boolean {
	return useSyncExternalStore(
		subscribeToSession,
		() => getAccessToken() !== null,
		() => false,
	);
}

/**
 * Keeps the bell and the Notifications screen live. Mounted once, high in the
 * tree, because a notification is addressed to the account rather than to
 * whichever screen happens to be open: the server delivers it to a room the
 * socket joined at the handshake, so it arrives wherever the user is.
 *
 * Refetches rather than patching the cache from the event. The list is short,
 * ordered and carries a count that has to agree with the server, and getting
 * that wrong shows a badge that will not clear.
 */
export function useNotificationSocket(): void {
	const client = useQueryClient();
	const ready = useSocketReady();

	useEffect(() => {
		const socket = getChatSocket();

		if (!socket) return;

		const onNotification = () => {
			void client.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
		};

		socket.on(NOTIFICATION_CREATED, onNotification);

		return () => {
			socket.off(NOTIFICATION_CREATED, onNotification);
		};
	}, [client, ready]);
}
