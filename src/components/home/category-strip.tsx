import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Brand, CategoryTone, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import { HOME_CATEGORIES, type HomeCategory } from "@/features/home/categories";

const DISC_SIZE = 37;
const ICON_SIZE = 20;

type CategoryButtonProps = {
	category: HomeCategory;
	onPress: (id: string) => void;
};

const CategoryButton = memo(function CategoryButton({ category, onPress }: CategoryButtonProps) {
	const { id, label, Icon, tone } = category;
	const { surface, icon } = CategoryTone[tone];

	return (
		<Pressable
			accessibilityHint={`Shows people and events in ${label}`}
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={() => onPress(id)}
			style={({ pressed }) => [styles.item, pressed && styles.pressed]}
		>
			<View style={[styles.disc, { backgroundColor: surface }]}>
				<Icon color={icon} height={ICON_SIZE} width={ICON_SIZE} />
			</View>

			<Text numberOfLines={1} style={styles.label}>
				{label}
			</Text>
		</Pressable>
	);
});

export type CategoryStripProps = {
	onSelect: (id: string) => void;
};

export function CategoryStrip({ onSelect }: CategoryStripProps) {
	return (
		<View style={styles.card}>
			<Text accessibilityRole="header" style={styles.title}>
				Categories
			</Text>

			<View style={styles.row}>
				{HOME_CATEGORIES.map((category) => (
					<CategoryButton category={category} key={category.id} onPress={onSelect} />
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Gap.card,
		padding: Gap.card,
		borderRadius: Radius.dialog,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	title: {
		...Type.sectionTitle,
		color: Ink.title,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: Spacing.one,
	},
	item: {
		flex: 1,
		alignItems: "center",
		gap: Gap.tight,
	},
	disc: {
		width: DISC_SIZE,
		height: DISC_SIZE,
		borderRadius: DISC_SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		...Type.categoryLabel,
		color: Ink.label,
		textAlign: "center",
	},
	pressed: {
		opacity: 0.7,
	},
});
