import { QueryClientProvider, focusManager, onlineManager } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { AppState, NativeModules, Platform, type AppStateStatus } from "react-native";

import { createQueryClient } from "@/lib/query/query-client";

type NetInfoModule = typeof import("@react-native-community/netinfo");

/**
 * Probed and loaded on first use for the same reason as the secure store, and
 * with the same caveat that Metro turns a throwing module factory into a red
 * screen a `try`/`catch` never sees. `NativeModules.RNCNetInfo` is the lookup the
 * package itself performs on React Native 0.86, so a null here is exactly the
 * case where importing it would throw. Without it every request is treated as
 * online, which is what react-query does by default anyway.
 */
function netInfo(): NetInfoModule["default"] | null {
	if (!NativeModules.RNCNetInfo) return null;

	// eslint-disable-next-line @typescript-eslint/no-require-imports -- a static import would run before the probe
	return (require("@react-native-community/netinfo") as NetInfoModule).default;
}

/**
 * React Native has no browser online event, so connectivity comes from NetInfo
 * instead. Without this a query queued in a tunnel burns its retries before the
 * connection is back.
 */
const connectivity = netInfo();

if (connectivity) {
	onlineManager.setEventListener((setOnline) =>
		connectivity.addEventListener((state) => setOnline(state.isConnected === true)),
	);
}

export function QueryProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(createQueryClient);

	/**
	 * The web notion of window focus does not exist on a phone either, so
	 * returning from the background is what marks data as worth refetching.
	 */
	useEffect(() => {
		if (Platform.OS === "web") return;

		const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
			focusManager.setFocused(status === "active");
		});

		return () => subscription.remove();
	}, []);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
