import type { FC } from "react";
import { useMemo, useState } from "react";
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import CheckIcon from "@/assets/auth/check.svg";
import { Chip } from "@/components/ui/chip";
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

const CHECK_SIZE = 18;
const ICON_SIZE = 22;

export type PickerOption = {
	id: string;
	label: string;
	Icon?: FC<SvgProps>;
};

export type PickerSheetProps = {
	visible: boolean;
	title: string;
	options: PickerOption[];
	/** Always an array; a single picker just holds at most one id. */
	value: string[];
	onChange: (ids: string[]) => void;
	onClose: () => void;
	multiple?: boolean;
	searchable?: boolean;
	searchPlaceholder?: string;
	emptyMessage?: string;
};

/**
 * One sheet behind the occupation, category and hobby fields. Single pickers
 * close on choice; multi ones stay open so several can be tapped in a row.
 */
export function PickerSheet({
	visible,
	title,
	options,
	value,
	onChange,
	onClose,
	multiple = false,
	searchable = false,
	searchPlaceholder = "Search here...",
	emptyMessage = "Nothing matches that search.",
}: PickerSheetProps) {
	const insets = useSafeAreaInsets();
	const [query, setQuery] = useState("");

	const visibleOptions = useMemo(() => {
		const trimmed = query.trim().toLowerCase();

		if (!searchable || trimmed.length === 0) return options;

		return options.filter((option) => option.label.toLowerCase().includes(trimmed));
	}, [options, query, searchable]);

	const close = () => {
		setQuery("");
		onClose();
	};

	const choose = (id: string) => {
		if (!multiple) {
			onChange([id]);
			close();
			return;
		}

		onChange(
			value.includes(id) ? value.filter((entry) => entry !== id) : [...value, id],
		);
	};

	return (
		<Modal
			animationType="slide"
			onRequestClose={close}
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<Pressable
				accessibilityLabel="Close"
				accessibilityRole="button"
				onPress={close}
				style={styles.scrim}
			/>

			<View
				accessibilityViewIsModal
				style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.four }]}
			>
				<Text accessibilityRole="header" style={styles.title}>
					{title}
				</Text>

				{searchable ? (
					<TextInput
						accessibilityLabel={`Search ${title.toLowerCase()}`}
						autoCapitalize="none"
						autoCorrect={false}
						clearButtonMode="while-editing"
						onChangeText={setQuery}
						placeholder={searchPlaceholder}
						placeholderTextColor={Ink.placeholder}
						returnKeyType="search"
						style={styles.search}
						value={query}
					/>
				) : null}

				<ScrollView
					bounces={false}
					contentContainerStyle={multiple ? styles.chipList : undefined}
					keyboardShouldPersistTaps="handled"
					style={styles.list}
				>
					{visibleOptions.length === 0 ? (
						<Text style={styles.empty}>{emptyMessage}</Text>
					) : null}

					{visibleOptions.map((option) =>
						multiple ? (
							<Chip
								key={option.id}
								label={option.label}
								onPress={() => choose(option.id)}
								selected={value.includes(option.id)}
							/>
						) : (
							<OptionRow
								Icon={option.Icon}
								key={option.id}
								label={option.label}
								onPress={() => choose(option.id)}
								selected={value.includes(option.id)}
							/>
						),
					)}
				</ScrollView>

				{multiple ? (
					<Pressable
						accessibilityLabel="Done"
						accessibilityRole="button"
						onPress={close}
						style={({ pressed }) => [styles.done, pressed && styles.pressed]}
					>
						<Text style={styles.doneLabel}>Done</Text>
					</Pressable>
				) : null}
			</View>
		</Modal>
	);
}

function OptionRow({
	label,
	selected,
	onPress,
	Icon,
}: {
	label: string;
	selected: boolean;
	onPress: () => void;
	Icon?: FC<SvgProps>;
}) {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="radio"
			accessibilityState={{ checked: selected }}
			onPress={onPress}
			style={({ pressed }) => [styles.option, pressed && styles.pressed]}
		>
			{Icon ? <Icon color={Brand.purple} height={ICON_SIZE} width={ICON_SIZE} /> : null}

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
	scrim: {
		flex: 1,
		backgroundColor: Ink.scrim,
	},
	sheet: {
		maxHeight: "72%",
		paddingTop: Spacing.four,
		paddingHorizontal: Spacing.three,
		borderTopLeftRadius: Radius.sheet,
		borderTopRightRadius: Radius.sheet,
		backgroundColor: Ink.surface,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
	},
	title: {
		...Type.sectionTitle,
		color: Ink.title,
	},
	search: {
		...Type.optionLabel,
		minHeight: MinTapTarget,
		marginTop: Spacing.two,
		paddingHorizontal: Spacing.one,
		borderBottomWidth: 1,
		borderBottomColor: Ink.rowBorder,
		color: Ink.title,
	},
	list: {
		marginTop: Spacing.two,
	},
	chipList: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Gap.snug,
		paddingVertical: Spacing.two,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget,
		borderBottomWidth: 1,
		borderBottomColor: Ink.rowBorder,
	},
	optionLabel: {
		...Type.optionLabel,
		flex: 1,
		color: Ink.body,
	},
	empty: {
		...Type.profileMeta,
		paddingVertical: Spacing.four,
		textAlign: "center",
		color: Ink.meta,
	},
	done: {
		minHeight: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
		marginTop: Spacing.two,
		borderRadius: Radius.control,
		backgroundColor: Brand.purple,
	},
	doneLabel: {
		...Type.cta,
		color: Brand.onBrand,
	},
	pressed: {
		opacity: 0.7,
	},
});
