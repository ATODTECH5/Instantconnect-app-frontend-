import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BOX_HEIGHT, CodeBoxes } from "@/components/auth/code-boxes";
import { Ink, Spacing, Type } from "@/constants/theme";

export type OtpInputProps = {
	value: string;
	onChange: (value: string) => void;
	length?: number;
	error?: string;
	editable?: boolean;
	autoFocus?: boolean;
	onComplete?: (value: string) => void;
};

/**
 * One real input behind the drawn boxes. Keeping a single field means paste,
 * SMS autofill and backspace all behave, which per-box inputs break.
 */
export function OtpInput({
	value,
	onChange,
	length = 4,
	error,
	editable = true,
	autoFocus = false,
	onComplete,
}: OtpInputProps) {
	const inputRef = useRef<TextInput>(null);
	const [isFocused, setIsFocused] = useState(false);

	const handleChange = useCallback(
		(next: string) => {
			const digits = next.replace(/\D/g, "").slice(0, length);
			onChange(digits);

			if (digits.length === length) onComplete?.(digits);
		},
		[length, onChange, onComplete],
	);

	const focus = useCallback(() => inputRef.current?.focus(), []);

	return (
		<View>
			<Pressable
				accessibilityElementsHidden
				importantForAccessibility="no-hide-descendants"
				onPress={focus}
			>
				<CodeBoxes active={isFocused} length={length} value={value} />
			</Pressable>

			<TextInput
				accessibilityHint={error}
				accessibilityLabel="Verification code"
				autoComplete="sms-otp"
				autoFocus={autoFocus}
				caretHidden
				editable={editable}
				keyboardType="number-pad"
				maxLength={length}
				onBlur={() => setIsFocused(false)}
				onChangeText={handleChange}
				onFocus={() => setIsFocused(true)}
				ref={inputRef}
				style={styles.hiddenInput}
				textContentType="oneTimeCode"
				value={value}
			/>

			{error ? (
				<Text role="alert" style={styles.error}>
					{error}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	// Covers the boxes so a tap anywhere on the row focuses the real field.
	hiddenInput: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: BOX_HEIGHT,
		opacity: 0,
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
		textAlign: "center",
		marginTop: Spacing.two,
	},
});
