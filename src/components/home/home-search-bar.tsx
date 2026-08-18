import { Platform, StyleSheet, TextInput, View } from "react-native";

import SearchIcon from "@/assets/map/search.svg";
import SlidersIcon from "@/assets/home/sliders.svg";
import { IconButton } from "@/components/ui/icon-button";
import { Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 20;
const FIELD_HEIGHT = 44;
const FILTER_WIDTH = 49;

export type HomeSearchBarProps = {
	value: string;
	onChangeText: (value: string) => void;
	onSubmit: () => void;
	onOpenFilters: () => void;
};

export function HomeSearchBar({
	value,
	onChangeText,
	onSubmit,
	onOpenFilters,
}: HomeSearchBarProps) {
	return (
		<View style={styles.row}>
			<View style={styles.field}>
				<SearchIcon color={Ink.placeholder} height={ICON_SIZE} width={ICON_SIZE} />

				<TextInput
					accessibilityLabel="Search by categories and events"
					autoCapitalize="none"
					onChangeText={onChangeText}
					onSubmitEditing={onSubmit}
					placeholder="Search by categories & events"
					placeholderTextColor={Ink.placeholder}
					returnKeyType="search"
					style={styles.input}
					value={value}
				/>
			</View>

			<IconButton
				Icon={SlidersIcon}
				accessibilityHint="Opens filters for the results below"
				accessibilityLabel="Filters"
				height={FIELD_HEIGHT}
				onPress={onOpenFilters}
				radius={Radius.dialog}
				tone="brand"
				width={FILTER_WIDTH}
			/>
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
