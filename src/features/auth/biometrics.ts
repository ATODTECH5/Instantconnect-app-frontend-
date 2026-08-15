import {
	AuthenticationType,
	authenticateAsync,
	hasHardwareAsync,
	isEnrolledAsync,
	supportedAuthenticationTypesAsync,
} from "expo-local-authentication";

export type BiometricKind = "face" | "fingerprint" | "biometrics";

export type BiometricSupport = {
	/** Both a sensor and at least one enrolled identity are required. */
	available: boolean;
	kind: BiometricKind;
};

const UNAVAILABLE: BiometricSupport = { available: false, kind: "biometrics" };

function describe(types: AuthenticationType[]): BiometricKind {
	if (types.includes(AuthenticationType.FACIAL_RECOGNITION)) return "face";
	if (types.includes(AuthenticationType.FINGERPRINT)) return "fingerprint";

	return "biometrics";
}

/**
 * Offering to enable biometrics on a device with nothing enrolled sends the
 * user to Settings for no reason, so both checks have to pass first.
 */
export async function getBiometricSupport(): Promise<BiometricSupport> {
	try {
		const [hasHardware, isEnrolled] = await Promise.all([
			hasHardwareAsync(),
			isEnrolledAsync(),
		]);

		if (!hasHardware || !isEnrolled) return UNAVAILABLE;

		return { available: true, kind: describe(await supportedAuthenticationTypesAsync()) };
	} catch {
		return UNAVAILABLE;
	}
}

export type BiometricPromptResult = { success: true } | { success: false; cancelled: boolean };

export async function promptBiometrics(promptMessage: string): Promise<BiometricPromptResult> {
	const result = await authenticateAsync({
		cancelLabel: "Not now",
		disableDeviceFallback: true,
		promptMessage,
	});

	if (result.success) return { success: true };

	return {
		success: false,
		cancelled: result.error === "user_cancel" || result.error === "system_cancel",
	};
}

export const BIOMETRIC_LABEL: Record<BiometricKind, string> = {
	face: "Face ID",
	fingerprint: "fingerprint",
	biometrics: "biometrics",
};
