import { useSyncExternalStore } from "react";

import type { ApiKinRelationship, ApiKycAdditionalIdKind } from "@/lib/api/kyc-schema";

/** A document already sitting with the provider; the name is only for the tile. */
export type UploadedDocument = { storageId: string; fileName: string };

export type IdStep = {
	nationalId: UploadedDocument;
	additionalIdKind: ApiKycAdditionalIdKind;
	additionalId: UploadedDocument;
};

export type AddressStep = {
	addressLine: string;
	country: string;
	state: string;
	city: string;
	utilityBill: UploadedDocument;
};

export type KinStep = {
	kinName: string;
	kinRelationship: ApiKinRelationship;
	kinPhone: string;
	kinEmail: string;
	kinAddress: string;
};

export type SelfieStep = { storageId: string; uri: string };

export type KycDraft = {
	id: IdStep | null;
	address: AddressStep | null;
	kin: KinStep | null;
	selfie: SelfieStep | null;
};

export const KYC_STEPS = ["id", "address", "kin", "selfie"] as const;

export type KycStepKey = (typeof KYC_STEPS)[number];

const EMPTY: KycDraft = { id: null, address: null, kin: null, selfie: null };

/**
 * The four steps are collected here and sent as one submission at the end,
 * so the server never holds a half-finished attempt. In memory only: the
 * documents are already uploaded, and a relaunch simply asks for them again
 * rather than keeping identity data on the device.
 */
let current: KycDraft = EMPTY;
const listeners = new Set<() => void>();

function publish(): void {
	for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

function getSnapshot(): KycDraft {
	return current;
}

export function saveKycStep<K extends KycStepKey>(step: K, value: KycDraft[K]): void {
	current = { ...current, [step]: value };
	publish();
}

export function clearKycDraft(): void {
	current = EMPTY;
	publish();
}

export function useKycDraft(): KycDraft {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** The first step still missing, or null once all four are in. */
export function nextKycStep(draft: KycDraft): KycStepKey | null {
	return KYC_STEPS.find((step) => draft[step] === null) ?? null;
}
