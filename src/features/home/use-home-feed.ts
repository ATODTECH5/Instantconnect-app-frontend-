import { useCallback, useEffect, useRef, useState } from "react";

import { fetchHomeFeed, HomeFeedError, type HomeFeed } from "@/features/home/home-feed";

export type HomeFeedStatus = "loading" | "ready" | "error";

export type HomeFeedState = {
	status: HomeFeedStatus;
	feed: HomeFeed | null;
	error: string | null;
	refreshing: boolean;
	reload: () => void;
	refresh: () => void;
};

const GENERIC_ERROR = "We could not load your feed. Check your connection and try again.";

export function useHomeFeed(): HomeFeedState {
	const [status, setStatus] = useState<HomeFeedStatus>("loading");
	const [feed, setFeed] = useState<HomeFeed | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const applyFeed = useCallback((next: HomeFeed) => {
		if (!isMountedRef.current) return;

		setFeed(next);
		setError(null);
		setStatus("ready");
	}, []);

	const applyError = useCallback((cause: unknown) => {
		if (!isMountedRef.current) return;

		setError(cause instanceof HomeFeedError ? cause.message : GENERIC_ERROR);
		setStatus("error");
	}, []);

	const settle = useCallback(() => {
		if (isMountedRef.current) setRefreshing(false);
	}, []);

	const runFetch = useCallback(() => {
		fetchHomeFeed().then(applyFeed).catch(applyError).finally(settle);
	}, [applyError, applyFeed, settle]);

	useEffect(() => {
		runFetch();
	}, [runFetch]);

	const reload = useCallback(() => {
		setStatus("loading");
		runFetch();
	}, [runFetch]);

	const refresh = useCallback(() => {
		setRefreshing(true);
		runFetch();
	}, [runFetch]);

	return { status, feed, error, refreshing, reload, refresh };
}
