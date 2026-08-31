import { useCallback, useEffect, useRef, useState } from "react";

export type SearchConnectState = "idle" | "pending" | "sent" | "failed";

export type SearchConnectRequests = {
	stateFor: (personId: string) => SearchConnectState;
	connect: (personId: string) => void;
};

const OPTIMISTIC_DELAY_MS = 650;

/**
 * Search still reads a local catalogue of people, places, events and work
 * spaces, and only people has an endpoint behind it. Its ids therefore do not
 * exist on the server, so Connect cannot call the real one yet without a 404.
 * Delete this together with `search-catalog.ts` when search is wired, and use
 * `features/discover/use-connect-requests` instead.
 */
export function useSearchConnect(): SearchConnectRequests {
	const [states, setStates] = useState<Record<string, SearchConnectState>>({});
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const stateFor = useCallback(
		(personId: string) => states[personId] ?? "idle",
		[states],
	);

	const connect = useCallback((personId: string) => {
		setStates((current) => {
			if (current[personId] === "pending" || current[personId] === "sent") return current;

			return { ...current, [personId]: "pending" };
		});

		setTimeout(() => {
			if (isMountedRef.current) {
				setStates((current) => ({ ...current, [personId]: "sent" }));
			}
		}, OPTIMISTIC_DELAY_MS);
	}, []);

	return { stateFor, connect };
}
