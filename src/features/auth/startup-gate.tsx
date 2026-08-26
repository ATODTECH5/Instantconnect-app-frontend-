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

	return null;
}
