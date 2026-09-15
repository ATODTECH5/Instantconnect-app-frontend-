import { useEffect, useState } from "react";

/** Whole seconds until `iso`, never below zero, ticking once a second. */
export function useCountdown(iso: string | null): number {
	const target = iso ? new Date(iso).getTime() : null;
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (target === null || target <= Date.now()) return;

		const timer = setInterval(() => setNow(Date.now()), 1000);

		return () => clearInterval(timer);
	}, [target]);

	if (target === null) return 0;

	return Math.max(0, Math.floor((target - now) / 1000));
}

/** "1h 12m" above an hour, "12:05" below it, "now" at zero. */
export function formatCountdown(seconds: number): string {
	if (seconds <= 0) return "now";

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const rest = seconds % 60;

	if (hours > 0) return `${hours}h ${minutes}m`;

	return `${minutes}:${String(rest).padStart(2, "0")}`;
}
