import { useCallback, useEffect, useRef, useState } from "react";

export type JoinState = "idle" | "joining" | "joined";

const MOCK_LATENCY_MS = 650;

/** Mirrors `use-connect-requests`, for the Join Meetup control on event cards. */
export function useJoinMeetups() {
	const [states, setStates] = useState<Record<string, JoinState>>({});
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const stateFor = useCallback((id: string) => states[id] ?? "idle", [states]);

	const join = useCallback((id: string) => {
		setStates((current) => {
			if (current[id] === "joining" || current[id] === "joined") return current;

			return { ...current, [id]: "joining" };
		});

		const timer = setTimeout(() => {
			if (isMountedRef.current) {
				setStates((current) => ({ ...current, [id]: "joined" }));
			}
		}, MOCK_LATENCY_MS);

		return () => clearTimeout(timer);
	}, []);

	return { stateFor, join };
}
