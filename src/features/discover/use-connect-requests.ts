import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendConnectionRequest } from "@/features/discover/discovery-service";
import type { ConnectAttempt } from "@/features/discover/connect-action";

export type ConnectRequests = {
	attemptFor: (personId: string) => ConnectAttempt;
	connect: (personId: string) => void;
};

/**
 * The attempt map only covers the gap between the press and the refetch that
 * replaces it. Once discovery is invalidated the server's `connectionState` is
 * what the card reads, so a request survives leaving the screen.
 */
export function useConnectRequests(): ConnectRequests {
	const client = useQueryClient();
	const [attempts, setAttempts] = useState<Record<string, ConnectAttempt>>({});

	const setAttempt = useCallback((personId: string, attempt: ConnectAttempt) => {
		setAttempts((current) => ({ ...current, [personId]: attempt }));
	}, []);

	const mutation = useMutation({
		mutationFn: sendConnectionRequest,
		onMutate: (personId: string) => setAttempt(personId, "sending"),
		onSuccess: (_result, personId) => {
			setAttempt(personId, "idle");
			void client.invalidateQueries({ queryKey: ["discovery"] });
			void client.invalidateQueries({ queryKey: ["connections"] });
		},
		onError: (_error, personId) => setAttempt(personId, "failed"),
	});

	const attemptFor = useCallback(
		(personId: string) => attempts[personId] ?? "idle",
		[attempts],
	);

	const connect = useCallback(
		(personId: string) => {
			if (attempts[personId] === "sending") return;

			mutation.mutate(personId);
		},
		[attempts, mutation],
	);

	return { attemptFor, connect };
}
