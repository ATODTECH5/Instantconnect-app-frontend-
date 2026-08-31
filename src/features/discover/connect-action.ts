import type { ConnectionState } from "@/lib/api/discovery-schema";

/** Whether a request this session is still in flight, or failed. */
export type ConnectAttempt = "idle" | "sending" | "failed";

export type ConnectAction =
	| "connect"
	| "sending"
	| "requested"
	| "respond"
	| "connected"
	| "unavailable"
	| "retry";

export const CONNECT_LABEL: Record<ConnectAction, string> = {
	connect: "Connect",
	sending: "Sending",
	requested: "Requested",
	respond: "Respond",
	connected: "Connected",
	unavailable: "Unavailable",
	retry: "Try again",
};

/**
 * Only `connect` and `retry` may be pressed. `respond` is inert until the
 * Connection tab exists to answer a request on, and the server refuses a second
 * approach after a decline, so `unavailable` must not offer one.
 */
const PRESSABLE = new Set<ConnectAction>(["connect", "retry"]);

export const isConnectPressable = (action: ConnectAction): boolean => PRESSABLE.has(action);

/**
 * The server's state is the truth; the attempt only covers the gap between a
 * press and the refetch that confirms it.
 */
export function connectActionFor(
	state: ConnectionState,
	attempt: ConnectAttempt = "idle",
): ConnectAction {
	if (attempt === "sending") return "sending";

	switch (state) {
		case "connected":
			return "connected";
		case "outgoing_pending":
			return "requested";
		case "incoming_pending":
			return "respond";
		case "declined":
			return "unavailable";
		default:
			return attempt === "failed" ? "retry" : "connect";
	}
}
