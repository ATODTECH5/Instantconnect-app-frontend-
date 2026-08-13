import type { FC } from "react";
import { Pressable, StyleSheet } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Ink } from "@/constants/theme";

const BUTTON_SIZE = 44;
const ICON_SIZE = 24;

export type GlassIconButtonProps = {
	Icon: FC<SvgProps>;
	accessibilityLabel: string;
	onPress: () => void;
};

/** Translucent circular control for use on top of the brand gradient. */
export function GlassIconButton({ Icon, accessibilityLabel, onPress }: GlassIconButtonProps) {
	return (
		<Pressable
			accessibilityLabel={accessibilityLabel}
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [styles.button, pressed && styles.pressed]}
		>
			<Icon color={Ink.surface} height={ICON_SIZE} width={ICON_SIZE} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		width: BUTTON_SIZE,
		height: BUTTON_SIZE,
		borderRadius: BUTTON_SIZE / 2,
		backgroundColor: "rgba(255, 255, 255, 0.149)",
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	pressed: {
		opacity: 0.7,
	},
});
