import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { SignUpInput } from "@/features/auth/sign-up-schema";

type SignUpDraftValue = {
	draft: SignUpInput | null;
	setDraft: (draft: SignUpInput) => void;
	clearDraft: () => void;
};

const SignUpDraftContext = createContext<SignUpDraftValue | null>(null);

/**
 * Holds the validated form between the sign up screen and the terms gate that
 * submits it. Route params would put the password in a URL, so it lives here.
 */
export function SignUpDraftProvider({ children }: { children: ReactNode }) {
	const [draft, setDraftState] = useState<SignUpInput | null>(null);

	const setDraft = useCallback((next: SignUpInput) => setDraftState(next), []);
	const clearDraft = useCallback(() => setDraftState(null), []);

	const value = useMemo(() => ({ draft, setDraft, clearDraft }), [draft, setDraft, clearDraft]);

	return <SignUpDraftContext.Provider value={value}>{children}</SignUpDraftContext.Provider>;
}

export function useSignUpDraft() {
	const value = useContext(SignUpDraftContext);

	if (!value) throw new Error("useSignUpDraft must be used inside SignUpDraftProvider");

	return value;
}
