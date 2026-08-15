import { useCallback, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, TextInput, View } from "react-native";

import SearchIcon from "@/assets/map/search.svg";
import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 20;

export type MapSearchBarProps = {
	onSearch: (query: string) => void;
	busy?: boolean;
};

export function MapSearchBar({ onSearch, busy = false }: MapSearchBarProps) {
	const [query, setQuery] = useState("");

	const handleSubmit = useCallback(() => onSearch(query), [onSearch, query]);

	return (
		<View style={styles.bar}>
			<SearchIcon color={Ink.placeholder} height={ICON_SIZE} width={ICON_SIZE} />

			<TextInput
				accessibilityLabel="Search street or place"
				autoCapitalize="words"
				editable={!busy}
				onChangeText={setQuery}
				onSubmitEditing={handleSubmit}
				placeholder="Search Street, places..."
				placeholderTextColor={Ink.placeholder}
				returnKeyType="search"
				style={styles.input}
				value={query}
			/>

			{busy ? <ActivityIndicator color={Brand.purple} size="small" /> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	bar: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two + Spacing.half,
		minHeight: MinTapTarget,
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.control,
		backgroundColor: Ink.surface,
		// Keeps the bar readable where it sits over pale map tiles.
		...Platform.select({
			ios: {
				shadowColor: "#000000",
				shadowOpacity: 0.12,
				shadowRadius: 12,
				shadowOffset: { width: 0, height: 4 },
			},
			android: { elevation: 4 },
			default: {},
		}),
	},
	input: {
		...Type.fieldValue,
		flex: 1,
		color: Ink.title,
		paddingVertical: Spacing.two,
		...Platform.select({ android: { includeFontPadding: false, textAlignVertical: "center" } }),
	},
});
