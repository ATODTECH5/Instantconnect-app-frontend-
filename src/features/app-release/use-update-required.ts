import { useQuery } from "@tanstack/react-query";

import { type AppRelease, fetchAppRelease, installedVersion, isOlderThan } from "./app-release";

/** A failed check lets the app run: being offline must not lock anyone out. */
export function useUpdateRequired(): AppRelease | null {
	const release = useQuery({
		queryKey: ["app-release"],
		queryFn: fetchAppRelease,
		staleTime: Infinity,
		retry: 1,
	});

	const minimum = release.data?.minimumVersion;

	if (!release.data || !minimum || !installedVersion) return null;

	return isOlderThan(installedVersion, minimum) ? release.data : null;
}
