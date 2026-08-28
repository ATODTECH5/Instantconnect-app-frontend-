import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import {
	fetchDiscoverPeople,
	fetchPersonProfile,
	type PersonProfile,
} from "@/features/discover/discover-feed";

export function useDiscoverPeople(categoryId: string): UseQueryResult<PersonProfile[]> {
	return useQuery({
		queryKey: ["discovery", categoryId],
		queryFn: () => fetchDiscoverPeople(categoryId),
	});
}

export function usePersonProfile(id: string): UseQueryResult<PersonProfile> {
	return useQuery({
		queryKey: ["discovery", "person", id],
		queryFn: () => fetchPersonProfile(id),
		enabled: id.length > 0,
	});
}
