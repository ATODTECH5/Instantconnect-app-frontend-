import { useCallback, useEffect, useRef, useState } from "react";

import { sendConnectionRequest } from "@/features/home/home-feed";

export type ConnectionState = "idle" | "pending" | "sent" | "failed";

export type ConnectRequests = {
	stateFor: (personId: string) => ConnectionState;
	connect: (personId: string) => void;
};

export function useConnectRequests(): ConnectRequests {
	const [states, setStates] = useState<Record<string, ConnectionState>>({});
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const stateFor = useCallback((personId: string) => states[personId] ?? "idle", [states]);

	const connect = useCallback((personId: string) => {
		setStates((current) => {
			if (current[personId] === "pending" || current[personId] === "sent") return current;

			return { ...current, [personId]: "pending" };
		});

		sendConnectionRequest(personId)
			.then(() => {
				if (isMountedRef.current) {
					setStates((current) => ({ ...current, [personId]: "sent" }));
				}
			})
			.catch(() => {
				if (isMountedRef.current) {
					setStates((current) => ({ ...current, [personId]: "failed" }));
				}
			});
	}, []);

	return { stateFor, connect };
}
