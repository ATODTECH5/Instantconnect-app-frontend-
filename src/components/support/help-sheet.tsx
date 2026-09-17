import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";

import { FaqItem } from "@/components/support/faq-item";
import { StateMessage } from "@/components/ui/state-message";
import { SearchField } from "@/components/ui/search-field";
import { TallSheet } from "@/components/ui/tall-sheet";
import { Ink, Spacing, Type } from "@/constants/theme";
import { FAQS, type Faq } from "@/features/support/faqs";

export type HelpSheetProps = {
	visible: boolean;
	onDismiss: () => void;
};

/** Help (Figma 3101:1490): a search box over the FAQ accordion. */
export function HelpSheet({ visible, onDismiss }: HelpSheetProps) {
	const [query, setQuery] = useState("");

	const items = useMemo(() => {
		const needle = query.trim().toLowerCase();

		return needle
			? FAQS.filter(
					(faq) =>
						faq.question.toLowerCase().includes(needle) ||
						faq.answer.toLowerCase().includes(needle),
				)
			: FAQS;
	}, [query]);

	return (
		<TallSheet onDismiss={onDismiss} title="Help" visible={visible}>
			<FlatList
				ListEmptyComponent={<StateMessage message="No articles match that search." />}
				ListHeaderComponent={
					<>
						<SearchField
							accessibilityLabel="Search help articles"
							onChangeText={setQuery}
							onSubmit={() => {}}
							placeholder="Search for FAQs topic, article..."
							value={query}
						/>

						<Text style={styles.heading}>Frequently Asked Questions</Text>
					</>
				}
				contentContainerStyle={styles.list}
				data={items}
				keyExtractor={(faq: Faq) => faq.id}
				keyboardShouldPersistTaps="handled"
				renderItem={({ item }) => <FaqItem faq={item} />}
				showsVerticalScrollIndicator={false}
			/>
		</TallSheet>
	);
}

const styles = StyleSheet.create({
	list: {
		gap: Spacing.three,
		paddingBottom: Spacing.five,
	},
	heading: {
		...Type.subtitle,
		fontSize: 17,
		color: Ink.title,
		paddingTop: Spacing.one,
	},
});
