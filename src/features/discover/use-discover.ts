import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import {
	fetchNearbyPeople,
	fetchPersonProfile,
	type NearbyQuery,
} from "@/features/discover/discovery-service";
import type { ApiDiscoveryPage, ApiPersonProfile } from "@/lib/api/discovery-schema";

/** The grid asks for a whole category at once rather than paging. */
const GRID_PAGE_SIZE = 50;

export function useDiscoverPeople(categoryId: string): UseQueryResult<ApiDiscoveryPage> {
	return useQuery({
		queryKey: ["discovery", "people", { categoryId }],
		queryFn: () => fetchNearbyPeople({ categoryId, limit: GRID_PAGE_SIZE }),
	});
}

export function useNearbyPeople(query: NearbyQuery): UseQueryResult<ApiDiscoveryPage> {
	return useQuery({
		queryKey: ["discovery", "people", query],
		queryFn: () => fetchNearbyPeople(query),
	});
}

export function usePersonProfile(id: string): UseQueryResult<ApiPersonProfile> {
	return useQuery({
		queryKey: ["discovery", "person", id],
		queryFn: () => fetchPersonProfile(id),
		enabled: id.length > 0,
	});
}
