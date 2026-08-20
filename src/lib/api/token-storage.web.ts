const STORAGE_KEY = "instant-connect.refresh-session";

/**
 * The web build has no keychain, so this is `localStorage` and a refresh token
 * kept here is readable by any script on the origin. Acceptable for the
 * development web target only; the shipping clients are iOS and Android.
 */
function storage(): Storage | null {
	return typeof localStorage === "undefined" ? null : localStorage;
}

export async function readPersistedSession(): Promise<string | null> {
	return storage()?.getItem(STORAGE_KEY) ?? null;
}

export async function writePersistedSession(value: string): Promise<void> {
	storage()?.setItem(STORAGE_KEY, value);
}

export async function clearPersistedSession(): Promise<void> {
	storage()?.removeItem(STORAGE_KEY);
}
