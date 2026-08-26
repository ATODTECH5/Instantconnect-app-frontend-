import { getSecureStore, secureStoreOptions } from "@/lib/api/secure-store";

const STORAGE_KEY = "instant-connect.refresh-session";

/**
 * An unreadable keychain entry has to mean "signed out" rather than a crash on
 * launch, which is the one case where discarding the error is the safe choice.
 */
export async function readPersistedSession(): Promise<string | null> {
	const store = getSecureStore();

	if (!store) return null;

	try {
		return await store.getItemAsync(STORAGE_KEY, secureStoreOptions(store));
	} catch {
		return null;
	}
}

export async function writePersistedSession(value: string): Promise<void> {
	const store = getSecureStore();

	if (!store) return;

	await store.setItemAsync(STORAGE_KEY, value, secureStoreOptions(store));
}

export async function clearPersistedSession(): Promise<void> {
	const store = getSecureStore();

	if (!store) return;

	await store.deleteItemAsync(STORAGE_KEY, secureStoreOptions(store));
}
