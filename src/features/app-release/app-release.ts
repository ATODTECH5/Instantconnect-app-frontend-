import { nativeApplicationVersion } from "expo-application";
import { z } from "zod";

import { request } from "@/lib/api/api-client";

const appReleaseSchema = z.object({
	minimumVersion: z.string().nullable(),
	appStoreUrl: z.string().nullable(),
	playStoreUrl: z.string().nullable(),
});

export type AppRelease = z.infer<typeof appReleaseSchema>;

export function fetchAppRelease(): Promise<AppRelease> {
	return request("/app/release", { schema: appReleaseSchema });
}

function parts(version: string): number[] {
	return version.split(".").map((part) => Number.parseInt(part, 10) || 0);
}

/** Plain major.minor.patch comparison; missing parts count as zero. */
export function isOlderThan(version: string, minimum: string): boolean {
	const a = parts(version);
	const b = parts(minimum);

	for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
		const difference = (a[index] ?? 0) - (b[index] ?? 0);

		if (difference !== 0) return difference < 0;
	}

	return false;
}

/**
 * The native version, not the JS bundle's: an over-the-air update can ship
 * new JavaScript but cannot replace native code, which is what a forced
 * store update is for.
 */
export const installedVersion = nativeApplicationVersion;
