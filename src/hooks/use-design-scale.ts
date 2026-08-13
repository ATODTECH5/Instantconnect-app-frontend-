import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { DesignFrame } from "@/constants/theme";

/**
 * The artboard is a 393x852 phone. Clamping keeps a small screen from crushing
 * the layout and a tablet from inflating it past a comfortable reading size.
 */
const MIN_SCALE = 0.68;
const MAX_SCALE = 1.15;

function clamp(value: number) {
	return Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
}

export type DesignScale = {
	width: number;
	height: number;
	/** Multiplier for measurements taken across the artboard. */
	horizontal: number;
	/** Multiplier for the vertical rhythm between blocks. */
	vertical: number;
};

export function useDesignScale(): DesignScale {
	const { width, height } = useWindowDimensions();

	return useMemo(
		() => ({
			width,
			height,
			horizontal: clamp(width / DesignFrame.width),
			vertical: clamp(height / DesignFrame.height),
		}),
		[width, height],
	);
}
