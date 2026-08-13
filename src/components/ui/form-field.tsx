import { forwardRef, useCallback, useState } from "react";
import {
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
	type StyleProp,
	type TextInputProps,
	type ViewStyle,
} from "react-native";

import EyeIcon from "@/assets/auth/eye.svg";
import EyeOffIcon from "@/assets/auth/eye-off.svg";
import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const FIELD_HEIGHT = 52;
const ADORNMENT_SIZE = 24;

/** Half the label line height, so the label straddles the top border. */
const LABEL_OFFSET = -Type.fieldLabel.lineHeight / 2;

export type FormFieldProps = Omit<
	TextInputProps,
	"style" | "placeholderTextColor" | "secureTextEntry"
> & {
	label: string;
	error?: string;
	/** Masks the value and renders a show/hide toggle. */
	secure?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
};

export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
	{ label, error, secure = false, containerStyle, onFocus, onBlur, editable = true, ...rest },
	ref,
) {
	const [isFocused, setIsFocused] = useState(false);
	const [isRevealed, setIsRevealed] = useState(false);

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

	const toggleReveal = useCallback(() => setIsRevealed((visible) => !visible), []);

	const hasError = Boolean(error);
	const borderColor = hasError ? Ink.danger : isFocused ? Brand.purple : Ink.border;
	const labelColor = hasError ? Ink.danger : isFocused ? Brand.purple : Ink.body;
	const RevealIcon = isRevealed ? EyeIcon : EyeOffIcon;

	return (
		<View style={containerStyle}>
			<View style={[styles.box, { borderColor }, !editable && styles.boxDisabled]}>
				<Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
					{label}
				</Text>

				<TextInput
					{...rest}
					ref={ref}
					accessibilityHint={error}
					accessibilityLabel={label}
					editable={editable}
					onBlur={handleBlur}
					onFocus={handleFocus}
					placeholderTextColor={Ink.placeholder}
					secureTextEntry={secure && !isRevealed}
					style={styles.input}
				/>

				{secure ? (
					<Pressable
						accessibilityLabel={isRevealed ? "Hide password" : "Show password"}
						accessibilityRole="button"
						accessibilityState={{ selected: isRevealed }}
						hitSlop={Spacing.three}
						onPress={toggleReveal}
						style={styles.adornment}
					>
						<RevealIcon
							color={Ink.placeholder}
							height={ADORNMENT_SIZE}
							width={ADORNMENT_SIZE}
						/>
					</Pressable>
				) : null}
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
	box: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
		minHeight: FIELD_HEIGHT,
		paddingHorizontal: Spacing.three,
		borderWidth: 1,
		borderRadius: Radius.control,
		backgroundColor: Ink.surface,
	},
	boxDisabled: {
		backgroundColor: "#F7F7F9",
	},
	label: {
		...Type.fieldLabel,
		position: "absolute",
		top: LABEL_OFFSET,
		left: Spacing.three - Spacing.one,
		paddingHorizontal: Spacing.three - Spacing.one,
		backgroundColor: Ink.surface,
	},
	input: {
		...Type.fieldValue,
		flex: 1,
		color: Ink.title,
		paddingVertical: Spacing.two,
		// Android adds its own glyph padding, which breaks vertical centring.
		...Platform.select({ android: { includeFontPadding: false, textAlignVertical: "center" } }),
	},
	adornment: {
		minWidth: ADORNMENT_SIZE,
		minHeight: ADORNMENT_SIZE,
		maxHeight: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
		marginTop: Spacing.one + Spacing.half,
		marginLeft: Spacing.one,
	},
});
