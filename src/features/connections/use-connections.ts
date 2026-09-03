import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";

import { fetchConnections, respondToConnection } from "@/features/discover/discovery-service";
import type { ApiConnection, ApiConnectionPage } from "@/lib/api/discovery-schema";

export const CONNECTIONS_KEY = ["connections"] as const;

export function useConnections(
	status?: "pending" | "accepted" | "declined",
): UseQueryResult<ApiConnectionPage> {
	return useQuery({
		queryKey: [...CONNECTIONS_KEY, status ?? "all"],
		queryFn: () => fetchConnections(status),
	});
}

export type RespondInput = {
	id: string;
	status: "accepted" | "declined";
};

/**
 * Answering a request changes what both the connections list and the discovery
 * feed should show, since every discovery row carries a `connectionState`.
 * Invalidating both is cheaper than trying to patch two caches by hand.
 */
export function useRespondToConnection() {
	const client = useQueryClient();

	const mutation = useMutation<ApiConnection, unknown, RespondInput>({
		mutationFn: ({ id, status }) => respondToConnection(id, status),
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: CONNECTIONS_KEY });
			void client.invalidateQueries({ queryKey: ["discovery"] });
		},
	});

	const accept = useCallback(
		(id: string) => mutation.mutate({ id, status: "accepted" }),
		[mutation],
	);

	const decline = useCallback(
		(id: string) => mutation.mutate({ id, status: "declined" }),
		[mutation],
	);

	return {
		accept,
		decline,
		pendingId: mutation.isPending ? mutation.variables?.id : undefined,
		isError: mutation.isError,
	};
}
