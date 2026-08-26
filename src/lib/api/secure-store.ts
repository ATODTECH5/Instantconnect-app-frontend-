import { requireOptionalNativeModule } from "expo";

type SecureStoreModule = typeof import("expo-secure-store");
type SecureStoreOptions = import("expo-secure-store").SecureStoreOptions;

let cached: SecureStoreModule | null | undefined;

/**
 * Loaded on first use, and only once the native side is known to be there, since
 * a dev client built before `expo-secure-store` was added throws while the module
 * evaluates. A `try`/`catch` around the require cannot contain that, because
 * Metro runs every module factory inside `guardedLoadModule`, which hands the
 * error to `ErrorUtils.reportFatalError` and returns undefined instead of
 * rethrowing: the red screen shows up and the `catch` never runs. Probing the
 * native registry keeps the failure silent, and it costs only persistence, so the
 * user signs in again on the next cold start. Rebuilding the dev client restores
 * it with no code change.
 */
export function getSecureStore(): SecureStoreModule | null {
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
export function secureStoreOptions(store: SecureStoreModule): SecureStoreOptions {
	return {
		keychainService: "instant-connect.auth",
		keychainAccessible: store.AFTER_FIRST_UNLOCK,
	};
}
