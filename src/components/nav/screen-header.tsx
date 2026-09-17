import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ArrowLeftIcon from "@/assets/auth/arrow-left.svg";
import { Brand, Gap, Ink, Radius, Type } from "@/constants/theme";

const BUTTON_SIZE = 44;
const ICON_SIZE = 24;

export type ScreenHeaderProps = {
	title: string;
	onBack: () => void;
	backLabel?: string;
	/** Trailing control, such as the add button on Connections or Map on Visited Places. */
	trailing?: ReactNode;
	/** `onBrand` for a header sitting on the purple gradient, as Help & Support does. */
	tone?: "light" | "onBrand";
};

/** Circular back control plus screen title, on every pushed frame. */
export function ScreenHeader({
	title,
	onBack,
	backLabel = "Go back",
	trailing,
	tone = "light",
}: ScreenHeaderProps) {
	const onBrand = tone === "onBrand";

	return (
		<View style={styles.row}>
			<Pressable
				accessibilityLabel={backLabel}
				accessibilityRole="button"
				onPress={onBack}
				style={({ pressed }) => [
					styles.button,
					onBrand && styles.buttonOnBrand,
					pressed && styles.pressed,
				]}
			>
				<ArrowLeftIcon
					color={onBrand ? Brand.onBrand : Ink.title}
					height={ICON_SIZE}
					width={ICON_SIZE}
				/>
			</Pressable>

			{title ? (
				<Text
					accessibilityRole="header"
					numberOfLines={1}
					style={[styles.title, onBrand && styles.titleOnBrand]}
				>
					{title}
				</Text>
			) : null}

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
	buttonOnBrand: {
		borderWidth: 1,
		borderColor: Ink.glassOnBrandBorder,
		backgroundColor: Ink.glassOnBrand,
	},
	title: {
		...Type.screenTitle,
		flexShrink: 1,
		color: Ink.title,
	},
	titleOnBrand: {
		color: Brand.onBrand,
	},
	trailing: {
		marginLeft: "auto",
	},
	pressed: {
		opacity: 0.7,
	},
});
