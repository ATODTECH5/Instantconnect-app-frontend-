import { useCallback, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CodeBoxes } from "@/components/auth/code-boxes";
import { Keypad } from "@/components/auth/keypad";
import { Ink, Spacing, Type } from "@/constants/theme";

export type PinInputProps = {
	value: string;
	onChange: (value: string) => void;
	length?: number;
	error?: string;
	disabled?: boolean;
	onComplete?: (value: string) => void;
	/** Sits between the boxes and the keypad, where the artboard puts the CTA. */
	action?: ReactNode;
};

/** Code boxes driven by the in app keypad, never by the system keyboard. */
export function PinInput({
	value,
	onChange,
	length = 4,
	error,
	disabled = false,
	onComplete,
	action,
}: PinInputProps) {
	const handleDigit = useCallback(
		(digit: string) => {
			if (value.length >= length) return;

			const next = value + digit;
			onChange(next);

			if (next.length === length) onComplete?.(next);
		},
		[length, onChange, onComplete, value],
	);

	const handleDelete = useCallback(() => {
		onChange(value.slice(0, -1));
	}, [onChange, value]);

	return (
		<View style={styles.container}>
			<View
				accessibilityLabel={`PIN, ${value.length} of ${length} digits entered`}
				accessibilityRole="text"
			>
				<CodeBoxes active={!disabled} length={length} masked value={value} />
			</View>

			{error ? (
				<Text role="alert" style={styles.error}>
					{error}
				</Text>
			) : null}

			{action ? <View style={styles.action}>{action}</View> : null}

			<View style={styles.keypad}>
				<Keypad disabled={disabled} onDelete={handleDelete} onDigit={handleDigit} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "stretch",
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
		textAlign: "center",
		marginTop: Spacing.two,
	},
	action: {
		marginTop: Spacing.four,
	},
	keypad: {
		marginTop: Spacing.five,
	},
});
