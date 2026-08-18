import type { ReactElement } from "react";
import { FlatList, StyleSheet, View, type ListRenderItem } from "react-native";

import { StateMessage } from "@/components/ui/state-message";
import { Gap } from "@/constants/theme";

export type CardCarouselProps<TItem> = {
	data: TItem[];
	keyExtractor: (item: TItem) => string;
	renderCard: (item: TItem) => ReactElement;
	itemWidth: number;
	gap: number;
	edgeInset: number;
	emptyMessage: string;
	accessibilityLabel: string;
};

export function CardCarousel<TItem>({
	data,
	keyExtractor,
	renderCard,
	itemWidth,
	gap,
	edgeInset,
	emptyMessage,
	accessibilityLabel,
}: CardCarouselProps<TItem>) {
	if (data.length === 0) {
		return (
			<View style={{ paddingHorizontal: edgeInset }}>
				<StateMessage message={emptyMessage} />
			</View>
		);
	}

	const renderItem: ListRenderItem<TItem> = ({ item }) => renderCard(item);

	return (
		<FlatList
			accessibilityLabel={accessibilityLabel}
			contentContainerStyle={[styles.content, { gap, paddingHorizontal: edgeInset }]}
			data={data}
			getItemLayout={(_, index) => ({
				length: itemWidth + gap,
				offset: (itemWidth + gap) * index,
				index,
			})}
			horizontal
			keyExtractor={keyExtractor}
			renderItem={renderItem}
			showsHorizontalScrollIndicator={false}
		/>
	);
}

const styles = StyleSheet.create({
	content: {
		paddingVertical: Gap.tight,
	},
});
