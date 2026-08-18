import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { useNavBarInset } from "@/hooks/use-nav-bar-inset";

export type PlaceholderScreenProps = {
	title: string;
	description: string;
};

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
	const navInset = useNavBarInset();

	return (
		<SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
			<View style={[styles.column, { paddingBottom: navInset }]}>
				<Text accessibilityRole="header" style={styles.title}>
					{title}
				</Text>

				<Text style={styles.description}>{description}</Text>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	column: {
		flex: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.two,
		paddingHorizontal: Spacing.three,
	},
	title: {
		...Type.successTitle,
		color: Ink.title,
		textAlign: "center",
	},
	description: {
		...Type.successBody,
		color: Ink.muted,
		textAlign: "center",
	},
});
