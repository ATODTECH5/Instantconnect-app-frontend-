import { Pressable, StyleSheet, Text, View } from "react-native";

import { Brand, Ink, MinTapTarget, Spacing, Type } from "@/constants/theme";

export type SectionHeaderProps = {
	title: string;
	actionLabel?: string;
	onPressAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onPressAction }: SectionHeaderProps) {
	return (
		<View style={styles.row}>
			<Text accessibilityRole="header" style={styles.title}>
				{title}
			</Text>

			{actionLabel && onPressAction ? (
				<Pressable
					accessibilityHint={`Shows everything under ${title}`}
					accessibilityLabel={`${actionLabel}, ${title}`}
					accessibilityRole="button"
					hitSlop={Spacing.two}
					onPress={onPressAction}
					style={({ pressed }) => [styles.action, pressed && styles.pressed]}
				>
					<Text style={styles.actionLabel}>{actionLabel}</Text>
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.three,
	},
	title: {
		...Type.sectionTitle,
		flexShrink: 1,
		color: Ink.title,
	},
	action: {
		justifyContent: "center",
		minHeight: MinTapTarget / 2,
	},
	actionLabel: {
		...Type.sectionLink,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
