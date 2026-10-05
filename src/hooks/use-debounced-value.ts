import { useEffect, useState } from "react";

/** The value once it has stopped changing for `delayMs`, so a search waits for a pause in typing. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
	const [settled, setSettled] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setSettled(value), delayMs);

		return () => clearTimeout(timer);
	}, [value, delayMs]);

	return settled;
}
