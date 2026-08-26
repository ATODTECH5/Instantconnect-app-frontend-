import { getSecureStore, secureStoreOptions } from "@/lib/api/secure-store";

const ONBOARDING_KEY = "instant-connect.onboarding-seen";
const SEEN_VALUE = "1";

/**
 * An unreadable entry means the onboarding has simply not been recorded yet, so
 * it is shown again rather than crashing the launch gate.
 */
export async function readHasSeenOnboarding(): Promise<boolean> {
	const store = getSecureStore();

	if (!store) return false;

	try {
		return (await store.getItemAsync(ONBOARDING_KEY, secureStoreOptions(store))) === SEEN_VALUE;
	} catch {
		return false;
	}
}

export async function markOnboardingSeen(): Promise<void> {
	const store = getSecureStore();

	if (!store) return;

	try {
		await store.setItemAsync(ONBOARDING_KEY, SEEN_VALUE, secureStoreOptions(store));
	} catch {
		// A failed write only costs showing onboarding once more, so it is not
		// surfaced: the launch must not fail because a flag could not be saved.
	}
}
