import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";

import type { ApiSupportMessage, ApiSupportMessagePage } from "@/lib/api/support-schema";
import { fetchSupportMessages, sendSupportMessage } from "./support-service";

export const SUPPORT_MESSAGES_KEY = ["support", "messages"] as const;

export function useSupportMessages(): UseQueryResult<ApiSupportMessagePage> {
	return useQuery({ queryKey: SUPPORT_MESSAGES_KEY, queryFn: fetchSupportMessages });
}

/** The sent message is put straight into the cached page, so the thread does not flicker. */
export function useSendSupportMessage(): UseMutationResult<ApiSupportMessage, Error, string> {
	const client = useQueryClient();

	return useMutation({
		mutationFn: sendSupportMessage,
		onSuccess: (message) => {
			client.setQueryData<ApiSupportMessagePage>(SUPPORT_MESSAGES_KEY, (page) =>
				page
					? {
							...page,
							items: [message, ...page.items],
							page: { ...page.page, total: page.page.total + 1 },
						}
					: page,
			);
		},
	});
}
