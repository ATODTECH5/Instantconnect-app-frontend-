import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ArrowLeftIcon from "@/assets/auth/arrow-left.svg";
import { Gap, Ink, Radius, Type } from "@/constants/theme";

const BUTTON_SIZE = 44;
const ICON_SIZE = 24;

export type ScreenHeaderProps = {
	title: string;
	onBack: () => void;
	backLabel?: string;
	/** Trailing control, such as the add button on Connections or Map on Visited Places. */
	trailing?: ReactNode;
};

/** Circular back control plus screen title, on every pushed frame. */
export function ScreenHeader({
	title,
	onBack,
	backLabel = "Go back",
	trailing,
}: ScreenHeaderProps) {
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

			{trailing ? <View style={styles.trailing}>{trailing}</View> : null}
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
	trailing: {
		marginLeft: "auto",
	},
	pressed: {
		opacity: 0.7,
	},
});
