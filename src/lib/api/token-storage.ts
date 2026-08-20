import { requireOptionalNativeModule } from "expo";

type SecureStoreModule = typeof import("expo-secure-store");
type SecureStoreOptions = import("expo-secure-store").SecureStoreOptions;

const STORAGE_KEY = "instant-connect.refresh-session";

let cached: SecureStoreModule | null | undefined;

/**
 * Loaded on first use, and only once the native side is known to be there, since
 * a dev client built before `expo-secure-store` was added throws while the module
 * evaluates. A `try`/`catch` around the require cannot contain that, because
 * Metro runs every module factory inside `guardedLoadModule`, which hands the
 * error to `ErrorUtils.reportFatalError` and returns undefined instead of
 * rethrowing: the red screen shows up and the `catch` never runs. Probing the
 * native registry keeps the failure silent, and it costs only session
 * persistence, so the user signs in again on the next cold start. Rebuilding the
 * dev client restores it with no code change.
 */
function secureStore(): SecureStoreModule | null {
	if (cached === undefined) {
		cached = requireOptionalNativeModule("ExpoSecureStore")
			? // eslint-disable-next-line @typescript-eslint/no-require-imports -- a static import would run before the probe
				(require("expo-secure-store") as SecureStoreModule)
			: null;
	}

	return cached;
}

/**
 * `AFTER_FIRST_UNLOCK` rather than the `WHEN_UNLOCKED` default, because a token
 * refresh triggered while the screen is locked (a push handler, a background
 * fetch) cannot read an item the keychain is holding shut.
 */
function storeOptions(store: SecureStoreModule): SecureStoreOptions {
	return {
		keychainService: "instant-connect.auth",
		keychainAccessible: store.AFTER_FIRST_UNLOCK,
	};
}

/**
 * An unreadable keychain entry has to mean "signed out" rather than a crash on
 * launch, which is the one case where discarding the error is the safe choice.
 */
export async function readPersistedSession(): Promise<string | null> {
	const store = secureStore();

	if (!store) return null;

	try {
		return await store.getItemAsync(STORAGE_KEY, storeOptions(store));
	} catch {
		return null;
	}
}

export async function writePersistedSession(value: string): Promise<void> {
	const store = secureStore();

	if (!store) return;

	await store.setItemAsync(STORAGE_KEY, value, storeOptions(store));
}

export async function clearPersistedSession(): Promise<void> {
	const store = secureStore();

	if (!store) return;

	await store.deleteItemAsync(STORAGE_KEY, storeOptions(store));
}
