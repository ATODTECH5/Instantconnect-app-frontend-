import { io, type Socket } from "socket.io-client";

import { getApiOrigin } from "@/lib/api/api-config";
import { getAccessToken } from "@/lib/api/session-store";

/** Must match the server's constants exactly. */
export const MESSAGE_CREATED = "message.created";
export const TYPING = "conversation.typing";
export const READ = "conversation.read";
export const NOTIFICATION_CREATED = "notification.created";

let socket: Socket | null = null;

/**
 * One socket for the whole app. The server verifies the access token at the
 * handshake only, so a token that expires mid-session leaves the socket open
 * until it drops; reconnecting picks up whatever token is current by then.
 */
export function getChatSocket(): Socket | null {
	const token = getAccessToken();

	if (!token) return null;

	if (!socket) {
		socket = io(`${getApiOrigin()}/chat`, {
			auth: { token },
			transports: ["websocket"],
			autoConnect: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 8000,
		});
	}

	return socket;
}

/** Called on sign out: a socket authenticated as the previous account must not survive it. */
export function closeChatSocket(): void {
	socket?.removeAllListeners();
	socket?.disconnect();
	socket = null;
}
