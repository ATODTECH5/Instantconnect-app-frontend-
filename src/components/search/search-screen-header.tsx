import { Pressable, StyleSheet, Text, View } from "react-native";

import ArrowLeftIcon from "@/assets/auth/arrow-left.svg";
import { Gap, Ink, Radius, Type } from "@/constants/theme";

const BUTTON_SIZE = 44;
const ICON_SIZE = 24;

export type SearchScreenHeaderProps = {
	title: string;
	onBack: () => void;
	backLabel?: string;
};

/** Circular back control plus screen title, on every search and filter frame. */
export function SearchScreenHeader({
	title,
	onBack,
	backLabel = "Go back",
}: SearchScreenHeaderProps) {
	return (
		<View style={styles.row}>
			<Pressable
				accessibilityLabel={backLabel}
				accessibilityRole="button"
				onPress={onBack}
				style={({ pressed }) => [styles.button, pressed && styles.pressed]}
			>
				<ArrowLeftIcon color={Ink.title} height={ICON_SIZE} width={ICON_SIZE} />
			</Pressable>

			<Text accessibilityRole="header" numberOfLines={1} style={styles.title}>
				{title}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
	},
	button: {
		width: BUTTON_SIZE,
		height: BUTTON_SIZE,
		borderRadius: Radius.pill,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.glassOnLight,
	},
	title: {
		...Type.screenTitle,
		flexShrink: 1,
		color: Ink.title,
	},
	pressed: {
		opacity: 0.7,
	},
});
