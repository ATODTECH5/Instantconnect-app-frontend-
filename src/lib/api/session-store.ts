import { TOKEN_REFRESH_SKEW_MS } from "@/lib/api/api-config";
import {
	clearPersistedSession,
	readPersistedSession,
	writePersistedSession,
} from "@/lib/api/token-storage";

export type AuthSession = {
	accessToken: string;
	accessTokenExpiresAt: number;
	refreshToken: string;
	refreshTokenExpiresAt: number;
};

/** What the server returns on sign in and on every refresh. */
export type IssuedTokens = {
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresIn: number;
	refreshTokenExpiresAt: string;
};

/**
 * Only the refresh token survives the process. The access token is short lived
 * and is cheap to mint again, so writing it to disk would add exposure for
 * nothing.
 */
type PersistedSession = {
	refreshToken: string;
	refreshTokenExpiresAt: number;
};

let session: AuthSession | null = null;
const listeners = new Set<() => void>();

function publish(): void {
	for (const listener of listeners) listener();
}

export function subscribeToSession(listener: () => void): () => void {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

export function getSession(): AuthSession | null {
	return session;
}

export function getAccessToken(): string | null {
	return session?.accessToken ?? null;
}

export function hasFreshAccessToken(): boolean {
	if (!session) return false;

	return session.accessTokenExpiresAt - TOKEN_REFRESH_SKEW_MS > Date.now();
}

export function toSession(tokens: IssuedTokens): AuthSession {
	return {
		accessToken: tokens.accessToken,
		accessTokenExpiresAt: Date.now() + tokens.accessTokenExpiresIn * 1000,
		refreshToken: tokens.refreshToken,
		refreshTokenExpiresAt: new Date(tokens.refreshTokenExpiresAt).getTime(),
	};
}

export async function setSession(next: AuthSession): Promise<void> {
	session = next;
	publish();

	const persisted: PersistedSession = {
		refreshToken: next.refreshToken,
		refreshTokenExpiresAt: next.refreshTokenExpiresAt,
	};

	await writePersistedSession(JSON.stringify(persisted));
}

export async function clearSession(): Promise<void> {
	session = null;
	publish();
	await clearPersistedSession();
}

function parsePersisted(raw: string): PersistedSession | null {
	try {
		const parsed: unknown = JSON.parse(raw);

		if (typeof parsed !== "object" || parsed === null) return null;

		const { refreshToken, refreshTokenExpiresAt } = parsed as Partial<PersistedSession>;

		if (typeof refreshToken !== "string" || typeof refreshTokenExpiresAt !== "number") {
			return null;
		}

		return { refreshToken, refreshTokenExpiresAt };
	} catch {
		return null;
	}
}

/**
 * The stored refresh token for a cold start, or null when there is none or it
 * has already expired. An expired one is dropped rather than sent, since the
 * only answer it can get is a 401.
 */
export async function readRestorableRefreshToken(): Promise<string | null> {
	const raw = await readPersistedSession();

	if (!raw) return null;

	const persisted = parsePersisted(raw);

	if (!persisted) {
		await clearPersistedSession();

		return null;
	}

	if (persisted.refreshTokenExpiresAt <= Date.now()) {
		await clearPersistedSession();

		return null;
	}

	return persisted.refreshToken;
}

export function getRefreshToken(): string | null {
	return session?.refreshToken ?? null;
}
