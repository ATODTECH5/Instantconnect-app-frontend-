import { forwardRef, type FC, type ReactNode, useState } from "react";
import {
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	type TextInputProps,
	View,
} from "react-native";
import type { SvgProps } from "react-native-svg";

import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 18;
const MULTILINE_HEIGHT = 109;

type FrameProps = {
	label: string;
	error?: string;
	children: ReactNode;
};

/**
 * The Create Event form's field: the label sits above a filled box, unlike
 * `FormField` where it straddles the border. Kept separate so this frame can
 * match its design without changing every other form in the app.
 */
function StackedFrame({ label, error, children }: FrameProps) {
	return (
		<View style={styles.frame}>
			<Text style={[styles.label, error ? styles.labelError : null]}>{label}</Text>

			{children}

			{error ? (
				<Text role="alert" style={styles.error}>
					{error}
				</Text>
			) : null}
		</View>
	);
}

export type StackedTextFieldProps = Omit<TextInputProps, "style" | "placeholderTextColor"> & {
	label: string;
	error?: string;
};

export const StackedTextField = forwardRef<TextInput, StackedTextFieldProps>(
	function StackedTextField({ label, error, multiline, onFocus, onBlur, ...rest }, ref) {
		const [isFocused, setIsFocused] = useState(false);

		return (
			<StackedFrame error={error} label={label}>
				<TextInput
					{...rest}
					ref={ref}
					accessibilityHint={error}
					accessibilityLabel={label}
					multiline={multiline}
					onBlur={(event) => {
						setIsFocused(false);
						onBlur?.(event);
					}}
					onFocus={(event) => {
						setIsFocused(true);
						onFocus?.(event);
					}}
					placeholderTextColor={Ink.meta}
					style={[
						styles.box,
						styles.input,
						multiline && styles.multiline,
						isFocused && styles.boxFocused,
						error ? styles.boxError : null,
					]}
					textAlignVertical={multiline ? "top" : "center"}
				/>
			</StackedFrame>
		);
	},
);

export type StackedPressableFieldProps = {
	label: string;
	/** Shown when there is no value yet, in the placeholder colour. */
	placeholder: string;
	value: string | null;
	onPress: () => void;
	accessibilityHint: string;
	TrailingIcon?: FC<SvgProps>;
	LeadingIcon?: FC<SvgProps>;
	error?: string;
	disabled?: boolean;
};

/** A field that opens something (a picker, a sheet) instead of taking typing. */
export function StackedPressableField({
	label,
	placeholder,
	value,
	onPress,
	accessibilityHint,
	TrailingIcon,
	LeadingIcon,
	error,
	disabled = false,
}: StackedPressableFieldProps) {
	return (
		<StackedFrame error={error} label={label}>
			<Pressable
				accessibilityHint={error ?? accessibilityHint}
				accessibilityLabel={`${label}. ${value ?? placeholder}`}
				accessibilityRole="button"
				accessibilityState={{ disabled }}
				disabled={disabled}
				onPress={onPress}
				style={({ pressed }) => [
					styles.box,
					styles.row,
					error ? styles.boxError : null,
					pressed && styles.pressed,
					disabled && styles.disabled,
				]}
			>
				{LeadingIcon ? (
					<LeadingIcon color={Brand.purple} height={ICON_SIZE} width={ICON_SIZE} />
				) : null}

				<Text
					numberOfLines={1}
					style={[styles.value, value === null && styles.placeholder]}
				>
					{value ?? placeholder}
				</Text>

				{TrailingIcon ? (
					<TrailingIcon color={Ink.muted} height={ICON_SIZE} width={ICON_SIZE} />
				) : null}
			</Pressable>
		</StackedFrame>
	);
}

const styles = StyleSheet.create({
	frame: {
		gap: Gap.tight,
	},
	label: {
		...Type.stackedLabel,
		color: Ink.muted,
	},
	labelError: {
		color: Ink.danger,
	},
	box: {
		minHeight: MinTapTarget,
		paddingHorizontal: Gap.card,
		borderWidth: 1,
		borderColor: Ink.fieldBorder,
		borderRadius: Radius.control,
		backgroundColor: Ink.fieldFill,
	},
	boxFocused: {
		borderColor: Brand.purple,
	},
	boxError: {
		borderColor: Ink.danger,
	},
	input: {
		...Type.fieldValue,
		color: Ink.title,
		paddingVertical: Spacing.two,
		// Android adds its own glyph padding, which breaks vertical centring.
		...Platform.select({ android: { includeFontPadding: false } }),
	},
	multiline: {
		minHeight: MULTILINE_HEIGHT,
		paddingTop: Gap.card,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
	value: {
		...Type.fieldValue,
		flex: 1,
		color: Ink.body,
	},
	placeholder: {
		color: Ink.meta,
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
	},
	pressed: {
		opacity: 0.7,
	},
	disabled: {
		opacity: 0.6,
	},
});
