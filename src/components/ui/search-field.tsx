import { Platform, StyleSheet, TextInput, View } from "react-native";

import SearchIcon from "@/assets/map/search.svg";
import SlidersIcon from "@/assets/home/sliders.svg";
import { IconButton } from "@/components/ui/icon-button";
import { Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 20;
const FIELD_HEIGHT = 44;
const FILTER_WIDTH = 49;

export type SearchFieldProps = {
	value: string;
	onChangeText: (value: string) => void;
	onSubmit: () => void;
	/** Omit on screens whose design has no filter control, such as Safety Connections. */
	onOpenFilters?: () => void;
	placeholder: string;
	accessibilityLabel: string;
	autoFocus?: boolean;
	filterCount?: number;
};

/** Rounded field plus filter button, shared by the home feed and search. */
export function SearchField({
	value,
	onChangeText,
	onSubmit,
	onOpenFilters,
	placeholder,
	accessibilityLabel,
	autoFocus = false,
	filterCount = 0,
}: SearchFieldProps) {
	return (
		<View style={styles.row}>
			<View style={styles.field}>
				<SearchIcon color={Ink.placeholder} height={ICON_SIZE} width={ICON_SIZE} />

				<TextInput
					accessibilityLabel={accessibilityLabel}
					autoCapitalize="none"
					autoCorrect={false}
					autoFocus={autoFocus}
					onChangeText={onChangeText}
					onSubmitEditing={onSubmit}
					placeholder={placeholder}
					placeholderTextColor={Ink.placeholder}
					returnKeyType="search"
					style={styles.input}
					value={value}
				/>
			</View>

			{onOpenFilters ? (
				<IconButton
					Icon={SlidersIcon}
					accessibilityHint="Opens filters for the results below"
					accessibilityLabel="Filters"
					badgeCount={filterCount}
					height={FIELD_HEIGHT}
					onPress={onOpenFilters}
					radius={Radius.dialog}
					tone="brand"
					width={FILTER_WIDTH}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	field: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
		minHeight: FIELD_HEIGHT,
		paddingHorizontal: Gap.card,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.keypad,
	},
	input: {
		...Type.fieldValue,
		flex: 1,
		color: Ink.title,
		paddingVertical: Spacing.two,
		...Platform.select({
			android: { includeFontPadding: false, textAlignVertical: "center" },
		}),
	},
});
