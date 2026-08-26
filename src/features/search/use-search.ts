import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
	fetchSearchResults,
	fetchSuggestions,
	type SearchResults,
} from "@/features/search/search-catalog";
import type { SearchFilters, SearchTabId } from "@/features/search/search-filters";

const SUGGESTION_DEBOUNCE_MS = 250;

export function useDebounced<TValue>(value: TValue, delayMs: number): TValue {
	const [settled, setSettled] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setSettled(value), delayMs);

		return () => clearTimeout(timer);
	}, [delayMs, value]);

	return settled;
}

export function useSearchSuggestions(query: string): UseQueryResult<string[]> {
	const debounced = useDebounced(query.trim(), SUGGESTION_DEBOUNCE_MS);

	return useQuery({
		queryKey: ["search", "suggestions", debounced],
		queryFn: () => fetchSuggestions(debounced),
		enabled: debounced.length > 0,
	});
}

export type SearchResultsInput = {
	query: string;
	tab: SearchTabId;
	filters: SearchFilters;
	enabled: boolean;
};

export function useSearchResults({
	query,
	tab,
	filters,
	enabled,
}: SearchResultsInput): UseQueryResult<SearchResults> {
	return useQuery({
		queryKey: ["search", "results", query, tab, filters],
		queryFn: () => fetchSearchResults({ query, tab, filters }),
		enabled,
	});
}
