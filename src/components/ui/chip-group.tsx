import { ScrollView, StyleSheet, View } from "react-native";

import { Chip } from "@/components/ui/chip";
import { Gap, Spacing } from "@/constants/theme";

export type ChipOption = {
	id: string;
	label: string;
};

export type ChipGroupProps = {
	options: ChipOption[];
	selectedId?: string | null;
	onSelect: (id: string) => void;
	accessibilityLabel: string;
	/** Scrolls on one line instead of wrapping, for the result tab strip. */
	scrollable?: boolean;
	edgeInset?: number;
	accessibilityHintFor?: (option: ChipOption) => string;
};

export function ChipGroup({
	options,
	selectedId = null,
	onSelect,
	accessibilityLabel,
	scrollable = false,
	edgeInset = 0,
	accessibilityHintFor,
}: ChipGroupProps) {
	const chips = options.map((option) => (
		<Chip
			accessibilityHint={accessibilityHintFor?.(option)}
			key={option.id}
			label={option.label}
			onPress={() => onSelect(option.id)}
			selected={option.id === selectedId}
		/>
	));

	if (scrollable) {
		return (
			<ScrollView
				accessibilityLabel={accessibilityLabel}
				contentContainerStyle={[styles.strip, { paddingHorizontal: edgeInset }]}
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.scroller}
			>
				{chips}
			</ScrollView>
		);
	}

	return (
		<View accessibilityLabel={accessibilityLabel} style={styles.wrap}>
			{chips}
		</View>
	);
}

const styles = StyleSheet.create({
	/**
	 * A chip strip is one row tall. Without pinning its growth it absorbs the
	 * leftover height of any flex parent and opens a gap above and below.
	 */
	scroller: {
		flexGrow: 0,
	},
	wrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Gap.snug,
	},
	strip: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
		paddingVertical: Spacing.one,
	},
});
