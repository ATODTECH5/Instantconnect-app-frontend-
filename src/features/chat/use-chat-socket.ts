import { useQueryClient } from "@tanstack/react-query";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";

import {
	MESSAGE_CREATED,
	READ,
	TYPING,
	getChatSocket,
} from "@/features/chat/chat-socket";
import { CONVERSATIONS_KEY } from "@/features/chat/use-conversations";
import { MESSAGES_KEY } from "@/features/chat/use-thread";
import type { ApiMessage, ApiMessagePage } from "@/lib/api/chat-schema";
import { getAccessToken, subscribeToSession } from "@/lib/api/session-store";

type MessageCreated = {
	conversationId: string;
	senderId: string;
	message: ApiMessage;
};

/**
 * Whether a socket can exist yet. The session is restored asynchronously at
 * launch, so a screen can mount before there is any token to authenticate with.
 * Without this the effect would run once against a null socket and never try
 * again, leaving a cold start permanently without live delivery.
 */
function useSocketReady(): boolean {
	return useSyncExternalStore(
		subscribeToSession,
		() => getAccessToken() !== null,
		() => false,
	);
}

type ReadEvent = {
	conversationId: string;
	readerId: string;
	lastReadAt: string;
};

type TypingEvent = {
	conversationId: string;
	userId: string;
	isTyping: boolean;
};

/**
 * Cleared on its own if the other end goes quiet without sending a stop. Must
 * outlast the composer's own idle timer, so the real stop event normally wins
 * and this only catches the case where it was lost with the socket.
 */
const TYPING_TIMEOUT_MS = 8000;

export type ThreadSocket = {
	isPartyTyping: boolean;
	/** Debounced by the caller's own typing; safe to call on every keystroke. */
	setTyping: (isTyping: boolean) => void;
};

/**
 * Live delivery for one thread. The socket is an accelerator, not the source of
 * truth: everything it delivers is also reachable by refetching, so a device
 * with no socket behaves exactly as it did before, just slower to notice.
 */
export function useChatThreadSocket(conversationId: string): ThreadSocket {
	const client = useQueryClient();
	const ready = useSocketReady();
	const [isPartyTyping, setPartyTyping] = useState(false);
	const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	/**
	 * A stop event can be lost with the socket that would have carried it, which
	 * would leave the indicator on forever. It expires on its own instead.
	 */
	const noteTyping = useCallback((active: boolean) => {
		if (typingTimer.current) clearTimeout(typingTimer.current);

		setPartyTyping(active);

		if (active) {
			typingTimer.current = setTimeout(
				() => setPartyTyping(false),
				TYPING_TIMEOUT_MS,
			);
		}
	}, []);

	const setTyping = useCallback(
		(isTyping: boolean) => {
			getChatSocket()?.emit(TYPING, { conversationId, isTyping });
		},
		[conversationId],
	);

	useEffect(() => {
		const socket = getChatSocket();

		if (!socket) return;

		const join = () => socket.emit("conversation.join", conversationId);

		// Re-joined on every connect, not just the first: a reconnect is a new
		// socket to the server and remembers none of its rooms.
		join();
		socket.on("connect", join);

		const onMessage = (event: MessageCreated) => {
			if (event.conversationId !== conversationId) return;

			client.setQueryData<ApiMessagePage>(
				[...MESSAGES_KEY, conversationId],
				(current) => {
					if (!current) return current;

					// The sender already inserted it through the mutation's own
					// refetch, so a duplicate id is dropped rather than shown twice.
					if (current.items.some((item) => item.id === event.message.id)) {
						return current;
					}

					return {
						...current,
						items: [event.message, ...current.items],
						page: { ...current.page, total: current.page.total + 1 },
					};
				},
			);

			// Sending ends typing, whether or not a stop event arrives.
			noteTyping(false);

			// The list previews and orders by the last message, so it moves too.
			void client.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
		};

		const onRead = (event: ReadEvent) => {
			if (event.conversationId !== conversationId) return;

			// Only the other party's read position matters here: it is what
			// turns the viewer's own delivered ticks into read ticks.
			client.setQueryData<ApiMessagePage>(
				[...MESSAGES_KEY, conversationId],
				(current) =>
					current
						? { ...current, partyLastReadAt: event.lastReadAt }
						: current,
			);
		};

		const onTyping = (event: TypingEvent) => {
			if (event.conversationId !== conversationId) return;

			noteTyping(event.isTyping);
		};

		socket.on(MESSAGE_CREATED, onMessage);
		socket.on(READ, onRead);
		socket.on(TYPING, onTyping);

		return () => {
			socket.off("connect", join);
			socket.off(MESSAGE_CREATED, onMessage);
			socket.off(READ, onRead);
			socket.off(TYPING, onTyping);
			socket.emit("conversation.leave", conversationId);
			if (typingTimer.current) clearTimeout(typingTimer.current);
		};
	}, [conversationId, client, noteTyping, ready]);

	return { isPartyTyping, setTyping };
}

/**
 * Live delivery for the chat list. Only refreshes the list, since a thread the
 * user is not looking at has no messages cached worth patching.
 */
export function useChatListSocket(): void {
	const client = useQueryClient();
	const ready = useSocketReady();

	useEffect(() => {
		const socket = getChatSocket();

		if (!socket) return;

		const onMessage = () => {
			void client.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
		};

		socket.on(MESSAGE_CREATED, onMessage);

		return () => {
			socket.off(MESSAGE_CREATED, onMessage);
		};
	}, [client, ready]);
}
