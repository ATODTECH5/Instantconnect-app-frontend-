import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ClockIcon from "@/assets/search/clock.svg";
import CloseIcon from "@/assets/search/close.svg";
import SearchIcon from "@/assets/map/search.svg";
import { Brand, Gap, Ink, MinTapTarget, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 20;
const REMOVE_SIZE = 36;

export type SearchTermRowProps = {
	term: string;
	onPress: (term: string) => void;
	/** Omitted on suggestions, which have nothing to remove. */
	onRemove?: (term: string) => void;
	/** Paints the first suggestion as the leading match, per the artboard. */
	highlighted?: boolean;
	variant?: "recent" | "suggestion";
};

/**
 * One row of search text. Recent results lead with a clock and carry a remove
 * control; suggestions lead with a magnifier and do not.
 */
export const SearchTermRow = memo(function SearchTermRow({
	term,
	onPress,
	onRemove,
	highlighted = false,
	variant = "recent",
}: SearchTermRowProps) {
	const LeadingIcon = variant === "recent" ? ClockIcon : SearchIcon;

	return (
		<View style={styles.row}>
			<Pressable
				accessibilityHint="Runs this search"
				accessibilityLabel={term}
				accessibilityRole="button"
				onPress={() => onPress(term)}
				style={({ pressed }) => [styles.main, pressed && styles.pressed]}
			>
				<LeadingIcon color={Ink.meta} height={ICON_SIZE} width={ICON_SIZE} />

				<Text numberOfLines={1} style={[styles.label, highlighted && styles.highlighted]}>
					{term}
				</Text>
			</Pressable>

			{onRemove ? (
				<Pressable
					accessibilityHint="Removes this from your recent searches"
					accessibilityLabel={`Remove ${term}`}
					accessibilityRole="button"
					hitSlop={(MinTapTarget - REMOVE_SIZE) / 2}
					onPress={() => onRemove(term)}
					style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
				>
					<CloseIcon color={Ink.meta} height={ICON_SIZE} width={ICON_SIZE} />
				</Pressable>
			) : null}
		</View>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: MinTapTarget,
	},
	main: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		paddingVertical: Spacing.two,
	},
	label: {
		...Type.rowLabel,
		flexShrink: 1,
		color: Ink.body,
	},
	highlighted: {
		color: Brand.purpleLight,
	},
	remove: {
		width: REMOVE_SIZE,
		height: REMOVE_SIZE,
		alignItems: "center",
		justifyContent: "center",
	},
	pressed: {
		opacity: 0.6,
	},
});
