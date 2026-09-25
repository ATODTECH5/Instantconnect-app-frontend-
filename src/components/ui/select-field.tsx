import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CheckIcon from "@/assets/auth/check.svg";
import ChevronDownIcon from "@/assets/search/chevron-down.svg";
import { StackedPressableField } from "@/components/ui/stacked-field";
import {
	Brand,
	Gap,
	Ink,
	MaxColumnWidth,
	MinTapTarget,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";

const ICON_SIZE = 20;
const CHECK_SIZE = 18;

export type SelectOption = {
	id: string;
	label: string;
};

export type SelectFieldProps = {
	options: SelectOption[];
	value: string | null;
	onChange: (id: string | null) => void;
	placeholder: string;
	accessibilityLabel: string;
	sheetTitle: string;
	/** Null removes the "any" row, for a field that must end up with a value. */
	clearLabel?: string | null;
	/** Floating label on the border, matching `FormField`, for a select inside a form. */
	label?: string;
	error?: string;
	disabled?: boolean;
	/** `stacked` puts the label above a filled box, as the Create Event form does. */
	variant?: "outlined" | "stacked";
};

/** Half the label line height, so the label straddles the top border. */
const LABEL_OFFSET = -Type.fieldLabel.lineHeight / 2;

/** Dropdown trigger backed by a sheet, avoiding a native picker dependency. */
export function SelectField({
	options,
	value,
	onChange,
	placeholder,
	accessibilityLabel,
	sheetTitle,
	clearLabel = "Any category",
	label,
	error,
	disabled = false,
	variant = "outlined",
}: SelectFieldProps) {
	const insets = useSafeAreaInsets();
	const [isOpen, setIsOpen] = useState(false);

	const selected = options.find((option) => option.id === value) ?? null;
	const hasError = Boolean(error);

	const choose = (id: string | null) => {
		onChange(id);
		setIsOpen(false);
	};

	const openHint = `Opens the list of ${sheetTitle.toLowerCase()}`;

	return (
		<View>
			{variant === "stacked" ? (
				<StackedPressableField
					TrailingIcon={ChevronDownIcon}
					accessibilityHint={openHint}
					disabled={disabled}
					error={error}
					label={label ?? accessibilityLabel}
					onPress={() => setIsOpen(true)}
					placeholder={placeholder}
					value={selected?.label ?? null}
				/>
			) : (
				<Pressable
					accessibilityHint={error ?? openHint}
					accessibilityLabel={`${accessibilityLabel}. ${selected?.label ?? placeholder}`}
					accessibilityRole="button"
					accessibilityState={{ expanded: isOpen, disabled }}
					disabled={disabled}
					onPress={() => setIsOpen(true)}
					style={({ pressed }) => [
						styles.trigger,
						hasError && styles.triggerError,
						disabled && styles.triggerDisabled,
						pressed && styles.pressed,
					]}
				>
					{label ? (
						<Text
							numberOfLines={1}
							style={[styles.floatingLabel, hasError && styles.floatingLabelError]}
						>
							{label}
						</Text>
					) : null}

					<Text
						numberOfLines={1}
						style={[styles.triggerLabel, !selected && styles.placeholder]}
					>
						{selected?.label ?? placeholder}
					</Text>

					<ChevronDownIcon color={Ink.muted} height={ICON_SIZE} width={ICON_SIZE} />
				</Pressable>
			)}

			{hasError && variant === "outlined" ? (
				<Text role="alert" style={styles.error}>
					{error}
				</Text>
			) : null}

			<Modal
				animationType="slide"
				onRequestClose={() => setIsOpen(false)}
				statusBarTranslucent
				transparent
				visible={isOpen}
			>
				<Pressable
					accessibilityLabel="Close"
					accessibilityRole="button"
					onPress={() => setIsOpen(false)}
					style={styles.scrim}
				/>

				<View
					accessibilityViewIsModal
					style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.four }]}
				>
					<Text accessibilityRole="header" style={styles.sheetTitle}>
						{sheetTitle}
					</Text>

					<ScrollView bounces={false} style={styles.list}>
						{clearLabel !== null ? (
							<OptionRow
								label={clearLabel}
								onPress={() => choose(null)}
								selected={value === null}
							/>
						) : null}

						{options.map((option) => (
							<OptionRow
								key={option.id}
								label={option.label}
								onPress={() => choose(option.id)}
								selected={option.id === value}
							/>
						))}
					</ScrollView>
				</View>
			</Modal>
		</View>
	);
}

function OptionRow({
	label,
	selected,
	onPress,
}: {
	label: string;
	selected: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="radio"
			accessibilityState={{ checked: selected }}
			onPress={onPress}
			style={({ pressed }) => [styles.option, pressed && styles.pressed]}
		>
			<Text numberOfLines={1} style={styles.optionLabel}>
				{label}
			</Text>

			{selected ? (
				<CheckIcon color={Brand.purple} height={CHECK_SIZE} width={CHECK_SIZE} />
			) : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	trigger: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
		minHeight: MinTapTarget + Spacing.two,
		paddingHorizontal: Gap.card,
		borderRadius: Radius.control,
		borderWidth: 1,
		borderColor: Ink.border,
		backgroundColor: Ink.surface,
	},
	triggerError: {
		borderColor: Ink.danger,
	},
	triggerDisabled: {
		opacity: 0.6,
	},
	floatingLabel: {
		...Type.fieldLabel,
		position: "absolute",
		top: LABEL_OFFSET,
		left: Spacing.three - Spacing.one,
		paddingHorizontal: Spacing.three - Spacing.one,
		backgroundColor: Ink.surface,
		color: Ink.body,
	},
	floatingLabelError: {
		color: Ink.danger,
	},
	triggerLabel: {
		...Type.rowLabel,
		flexShrink: 1,
		color: Ink.title,
	},
	error: {
		...Type.fieldError,
		marginTop: Spacing.one + Spacing.half,
		color: Ink.danger,
	},
	placeholder: {
		color: Ink.placeholder,
	},
	scrim: {
		flex: 1,
		backgroundColor: Ink.scrim,
	},
	sheet: {
		maxHeight: "60%",
		paddingTop: Spacing.four,
		paddingHorizontal: Spacing.three,
		borderTopLeftRadius: Radius.sheet,
		borderTopRightRadius: Radius.sheet,
		backgroundColor: Ink.surface,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
	},
	sheetTitle: {
		...Type.sectionTitle,
		color: Ink.title,
	},
	list: {
		marginTop: Spacing.two,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
		minHeight: MinTapTarget,
		borderBottomWidth: 1,
		borderBottomColor: Ink.rowBorder,
	},
	optionLabel: {
		...Type.optionLabel,
		flexShrink: 1,
		color: Ink.body,
	},
	pressed: {
		opacity: 0.7,
	},
});
