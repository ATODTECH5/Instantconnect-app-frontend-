import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { BrandGradientStops, Ink, Radius, Type } from "@/constants/theme";

export const BOX_WIDTH = 44;
export const BOX_HEIGHT = 46;

const BOX_GAP = 14;
const BORDER_WIDTH = 1;
const CARET_HEIGHT = 32;
const BLINK_DURATION = 600;

/**
 * The artboard runs the border gradient along an axis longer than the box, so
 * only its middle shows: purple at the top left, orange clipping the bottom
 * right corner. These are the design's endpoints in box local coordinates.
 */
const BORDER_AXIS = { x1: 86, y1: 47.3, x2: -1.3, y2: -20.1 } as const;

export type CodeBoxesProps = {
	value: string;
	length: number;
	/** Lights the next empty box and shows a caret in it. */
	active: boolean;
	/** Renders dots instead of digits, for a PIN rather than a mailed code. */
	masked?: boolean;
};

/** Presentation only. The value comes from a hidden field or a keypad. */
export function CodeBoxes({ value, length, active, masked = false }: CodeBoxesProps) {
	const blink = useSharedValue(1);

	useEffect(() => {
		blink.value = withRepeat(withTiming(0, { duration: BLINK_DURATION }), -1, true);
	}, [blink]);

	const caretStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

	const activeIndex = Math.min(value.length, length - 1);

	return (
		<View style={styles.row}>
			{Array.from({ length }, (_, index) => {
				const digit = value[index];
				const isActive = active && index === activeIndex;
				const isLit = Boolean(digit) || isActive;
				const gradientId = `codeBorder-${index}`;

				return (
					<View key={index} style={styles.box}>
						<Svg height={BOX_HEIGHT} style={StyleSheet.absoluteFill} width={BOX_WIDTH}>
							{isLit ? (
								<Defs>
									<LinearGradient
										gradientUnits="userSpaceOnUse"
										id={gradientId}
										x1={BORDER_AXIS.x1}
										y1={BORDER_AXIS.y1}
										x2={BORDER_AXIS.x2}
										y2={BORDER_AXIS.y2}
									>
										{BrandGradientStops.map(({ offset, color }) => (
											<Stop key={color} offset={offset} stopColor={color} />
										))}
									</LinearGradient>
								</Defs>
							) : null}

							<Rect
								fill={Ink.surface}
								height={BOX_HEIGHT - BORDER_WIDTH}
								rx={Radius.codeBox}
								stroke={isLit ? `url(#${gradientId})` : Ink.borderStrong}
								strokeWidth={BORDER_WIDTH}
								width={BOX_WIDTH - BORDER_WIDTH}
								x={BORDER_WIDTH / 2}
								y={BORDER_WIDTH / 2}
							/>
						</Svg>

						{digit ? (
							masked ? (
								<View style={styles.dot} />
							) : (
								<Text style={styles.digit}>{digit}</Text>
							)
						) : isActive ? (
							<Animated.View style={[styles.caret, caretStyle]} />
						) : null}
					</View>
				);
			})}
		</View>
	);
}

const DOT_SIZE = 14;

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "center",
		gap: BOX_GAP,
	},
	box: {
		width: BOX_WIDTH,
		height: BOX_HEIGHT,
		alignItems: "center",
		justifyContent: "center",
	},
	digit: {
		...Type.otpDigit,
		color: Ink.body,
	},
	dot: {
		width: DOT_SIZE,
		height: DOT_SIZE,
		borderRadius: DOT_SIZE / 2,
		backgroundColor: Ink.body,
	},
	caret: {
		width: 1,
		height: CARET_HEIGHT,
		backgroundColor: Ink.body,
	},
});
