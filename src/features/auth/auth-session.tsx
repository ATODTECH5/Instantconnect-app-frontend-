import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from "react";

import { revokeRefreshToken } from "@/features/auth/auth-service";
import { restoreSession } from "@/lib/api/api-client";
import { describeError } from "@/lib/api/api-error";
import { clearSession, getSession, subscribeToSession } from "@/lib/api/session-store";

export type AuthStatus = "restoring" | "authenticated" | "unauthenticated";

type AuthSessionValue = {
	status: AuthStatus;
	/** Set only when the stored session could not be checked, so a retry is worth offering. */
	restoreError: string | null;
	retryRestore: () => void;
	endSession: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

/**
 * Owns whether there is a signed in session, separately from the query cache,
 * because the navigation gate has to answer that question on the first render
 * rather than after a hook resolves.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const session = useSyncExternalStore(subscribeToSession, getSession);
	const [isRestored, setIsRestored] = useState(false);
	const [restoreError, setRestoreError] = useState<string | null>(null);
	const wasAuthenticatedRef = useRef(false);

	const settleRestore = useCallback((error: string | null) => {
		setRestoreError(error);
		setIsRestored(true);
	}, []);

	const beginRestore = useCallback(() => {
		restoreSession()
			.then(() => settleRestore(null))
			.catch((cause: unknown) => settleRestore(describeError(cause)));
	}, [settleRestore]);

	useEffect(() => {
		beginRestore();
	}, [beginRestore]);

	const retryRestore = useCallback(() => {
		setIsRestored(false);
		setRestoreError(null);
		beginRestore();
	}, [beginRestore]);

	/**
	 * A session can also end without the user asking, when a refresh token is
	 * rejected or the family is revoked as theft. Clearing the cache here rather
	 * than in the sign out path covers both exits with one rule: no data outlives
	 * the session it was fetched for.
	 */
	useEffect(() => {
		const isAuthenticated = session !== null;

		if (wasAuthenticatedRef.current && !isAuthenticated) queryClient.clear();

		wasAuthenticatedRef.current = isAuthenticated;
	}, [queryClient, session]);

	/**
	 * The refresh token is revoked server side first, so signing out on this
	 * device cannot leave a usable token behind. A server that cannot be reached
	 * must not strand someone signed in, so the local session is dropped either
	 * way and the server expires the token on its own schedule.
	 */
	const endSession = useCallback(async () => {
		try {
			await revokeRefreshToken();
		} catch {
			// Deliberately not surfaced. Signing out has to succeed on the device
			// whatever the network did, and the server expires the token regardless.
		}

		await clearSession();
	}, []);

	const value = useMemo<AuthSessionValue>(() => {
		const status: AuthStatus = !isRestored
			? "restoring"
			: session
				? "authenticated"
				: "unauthenticated";

		return { status, restoreError, retryRestore, endSession };
	}, [endSession, isRestored, restoreError, retryRestore, session]);

	return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
	const value = useContext(AuthSessionContext);

	if (!value) throw new Error("useAuthSession must be used inside AuthSessionProvider");

	return value;
}
