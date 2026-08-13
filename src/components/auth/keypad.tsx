import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Ink, Type } from "@/constants/theme";

const KEY_SIZE = 72;
const COLUMN_GAP = 32;
const ROW_GAP = 12;
const GLYPH_SIZE = 24;

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export type KeypadProps = {
	onDigit: (digit: string) => void;
	onDelete: () => void;
	disabled?: boolean;
	accessory?: ReactNode;
};

export function Keypad({ onDigit, onDelete, disabled = false, accessory }: KeypadProps) {
	return (
		<View style={styles.grid}>
			{DIGITS.map((digit) => (
				<Key
					accessibilityLabel={digit}
					disabled={disabled}
					key={digit}
					onPress={() => onDigit(digit)}
				>
					<Text style={styles.digit}>{digit}</Text>
				</Key>
			))}

			<View style={styles.key}>{accessory}</View>

			<Key accessibilityLabel="0" disabled={disabled} onPress={() => onDigit("0")}>
				<Text style={styles.digit}>0</Text>
			</Key>

			<Key accessibilityLabel="Delete" disabled={disabled} onPress={onDelete}>
				<Svg height={GLYPH_SIZE} viewBox="0 0 24 24" width={GLYPH_SIZE}>
					<Path
						d="M9.5 5H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9.5a1 1 0 0 1-.74-.33l-5.4-6a1 1 0 0 1 0-1.34l5.4-6A1 1 0 0 1 9.5 5Z"
						fill="none"
						stroke={Ink.muted}
						strokeWidth="1.5"
					/>
					<Path
						d="M16.5 9.5 12 14M12 9.5l4.5 4.5"
						stroke={Ink.muted}
						strokeLinecap="round"
						strokeWidth="1.5"
					/>
				</Svg>
			</Key>
		</View>
	);
}

function Key({
	children,
	onPress,
	accessibilityLabel,
	disabled,
}: {
	children: ReactNode;
	onPress: () => void;
	accessibilityLabel: string;
	disabled: boolean;
}) {
	return (
		<Pressable
			accessibilityLabel={accessibilityLabel}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [styles.key, pressed && !disabled && styles.pressed]}
		>
			{children}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		columnGap: COLUMN_GAP,
		rowGap: ROW_GAP,
		maxWidth: KEY_SIZE * 3 + COLUMN_GAP * 2,
		alignSelf: "center",
	},
	key: {
		width: KEY_SIZE,
		height: KEY_SIZE,
		borderRadius: KEY_SIZE / 2,
		backgroundColor: Ink.keypad,
		alignItems: "center",
		justifyContent: "center",
	},
	pressed: {
		backgroundColor: Ink.keypadPressed,
	},
	digit: {
		...Type.keypadDigit,
		color: Ink.title,
	},
});
