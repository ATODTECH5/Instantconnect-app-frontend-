const ONBOARDING_KEY = "instant-connect.onboarding-seen";
const SEEN_VALUE = "1";

function storage(): Storage | null {
	return typeof localStorage === "undefined" ? null : localStorage;
}

export async function readHasSeenOnboarding(): Promise<boolean> {
	return storage()?.getItem(ONBOARDING_KEY) === SEEN_VALUE;
}

export async function markOnboardingSeen(): Promise<void> {
	storage()?.setItem(ONBOARDING_KEY, SEEN_VALUE);
}
