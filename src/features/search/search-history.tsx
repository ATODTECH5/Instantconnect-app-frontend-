import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const MAX_ENTRIES = 6;

const SEEDED: string[] = ["Café Bloom", "CoLab Workspace", "Freedom Pack", "Events"];

type SearchHistoryValue = {
	recents: string[];
	remember: (term: string) => void;
	forget: (term: string) => void;
	clear: () => void;
};

const SearchHistoryContext = createContext<SearchHistoryValue | null>(null);

/**
 * Recent searches for the session. Surviving a cold start needs a local storage
 * dependency the app does not carry yet, so this deliberately does not persist.
 */
export function SearchHistoryProvider({ children }: { children: ReactNode }) {
	const [recents, setRecents] = useState<string[]>(SEEDED);

	const remember = useCallback((term: string) => {
		const trimmed = term.trim();

		if (trimmed.length === 0) return;

		setRecents((current) =>
			[
				trimmed,
				...current.filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase()),
			].slice(0, MAX_ENTRIES),
		);
	}, []);

	const forget = useCallback((term: string) => {
		setRecents((current) => current.filter((entry) => entry !== term));
	}, []);

	const clear = useCallback(() => setRecents([]), []);

	const value = useMemo(
		() => ({ recents, remember, forget, clear }),
		[clear, forget, recents, remember],
	);

	return <SearchHistoryContext.Provider value={value}>{children}</SearchHistoryContext.Provider>;
}

export function useSearchHistory() {
	const value = useContext(SearchHistoryContext);

	if (!value) throw new Error("useSearchHistory must be used inside SearchHistoryProvider");

	return value;
}
