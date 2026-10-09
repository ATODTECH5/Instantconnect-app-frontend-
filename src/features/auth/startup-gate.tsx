import { router, useRootNavigationState } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useAuthSession } from "@/features/auth/auth-session";
import { readHasSeenOnboarding } from "@/lib/api/onboarding-storage";

type StartupGateProps = {
	/** Fired once the launch destination has been chosen, so the splash can lift. */
	onDecided: () => void;
};

/**
 * Runs once after launch and sends the user to the first screen that fits their
 * state: Home for a restored session, Sign In for a returning user without one,
 * and Onboarding for a first launch. A failed restore leaves the status
 * unauthenticated, so it routes to Sign In like any other signed out launch.
 */
export function StartupGate({ onDecided }: StartupGateProps) {
	const { status } = useAuthSession();
	const navigationState = useRootNavigationState();
	const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
	const hasRoutedRef = useRef(false);

	useEffect(() => {
		let cancelled = false;

		readHasSeenOnboarding().then((seen) => {
			if (!cancelled) setHasSeenOnboarding(seen);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (hasRoutedRef.current) return;
		if (!navigationState?.key || status === "restoring" || hasSeenOnboarding === null) return;

		hasRoutedRef.current = true;

		if (status === "authenticated") router.replace("/(tabs)");
		else if (hasSeenOnboarding) router.replace("/sign-in");
		else router.replace("/onboarding");

		onDecided();
	}, [navigationState?.key, status, hasSeenOnboarding, onDecided]);

	/**
	 * A session can end mid use (a rejected refresh token, a family revoked as
	 * theft), and every screen left open would then fail its requests with
	 * "could not load". The whole stack is dropped so Back cannot return to
	 * a screen that needs the old session.
	 */
	const previousStatusRef = useRef(status);

	useEffect(() => {
		const previous = previousStatusRef.current;

		previousStatusRef.current = status;

		if (!hasRoutedRef.current) return;
		if (previous !== "authenticated" || status !== "unauthenticated") return;

		if (router.canDismiss()) router.dismissAll();
		router.replace("/sign-in");
	}, [status]);

	return null;
}
