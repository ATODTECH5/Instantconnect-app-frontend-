import { forwardRef, useCallback, useState } from "react";
import {
	Platform,
	StyleSheet,
	Text,
	TextInput,
	View,
	type StyleProp,
	type TextInputProps,
	type ViewStyle,
} from "react-native";

import { Ink, Radius, Spacing, Type } from "@/constants/theme";

const FIELD_HEIGHT = 52;

/** The frame lights each field with a faint orange inset rather than a border. */
const GLOW = "inset 0px 0px 4px rgba(251, 146, 60, 0.28)";
const GLOW_FOCUSED = "inset 0px 0px 4px rgba(147, 51, 234, 0.4)";

export type CardFieldProps = Omit<TextInputProps, "style" | "placeholderTextColor"> & {
	label: string;
	error?: string;
	containerStyle?: StyleProp<ViewStyle>;
};

/**
 * The card form's own field: a small capitals label above the box, unlike
 * `FormField` where the label straddles the border. Kept separate so the
 * payment screens match their frame without changing every other form.
 */
export const CardField = forwardRef<TextInput, CardFieldProps>(function CardField(
	{ label, error, containerStyle, onFocus, onBlur, ...rest },
	ref,
) {
	const [isFocused, setIsFocused] = useState(false);

	const handleFocus = useCallback<NonNullable<TextInputProps["onFocus"]>>(
		(event) => {
			setIsFocused(true);
			onFocus?.(event);
		},
		[onFocus],
	);

	const handleBlur = useCallback<NonNullable<TextInputProps["onBlur"]>>(
		(event) => {
			setIsFocused(false);
			onBlur?.(event);
		},
		[onBlur],
	);

	const hasError = Boolean(error);

	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={[styles.label, hasError && styles.labelError]}>{label}</Text>

			<View style={[styles.box, isFocused && styles.boxFocused, hasError && styles.boxError]}>
				<TextInput
					{...rest}
					ref={ref}
					accessibilityHint={error}
					accessibilityLabel={label}
					onBlur={handleBlur}
					onFocus={handleFocus}
					placeholderTextColor={Ink.placeholder}
					style={styles.input}
				/>
			</View>

			{hasError ? (
				<Text role="alert" style={styles.error}>
					{error}
				</Text>
			) : null}
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		gap: Spacing.one,
	},
	label: {
		...Type.inputLabel,
		color: Ink.meta,
	},
	labelError: {
		color: Ink.danger,
	},
	box: {
		minHeight: FIELD_HEIGHT,
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.control,
		backgroundColor: Ink.surface,
		boxShadow: GLOW,
	},
	boxFocused: {
		boxShadow: GLOW_FOCUSED,
	},
	boxError: {
		borderWidth: 1,
		borderColor: Ink.danger,
	},
	input: {
		...Type.fieldValue,
		fontFamily: Type.action.fontFamily,
		color: Ink.title,
		paddingVertical: Spacing.two,
		...Platform.select({ android: { includeFontPadding: false, textAlignVertical: "center" } }),
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
	},
});
