import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { BrandGradient, Ink } from "@/constants/theme";

const BORDER_WIDTH = 1;

export type GradientFrameProps = {
	children: ReactNode;
	radius: number;
	style?: StyleProp<ViewStyle>;
};

export function GradientFrame({ children, radius, style }: GradientFrameProps) {
	return (
		<View style={[styles.frame, { borderRadius: radius + BORDER_WIDTH }, style]}>
			<View style={[styles.inner, { borderRadius: radius }]}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	frame: {
		padding: BORDER_WIDTH,
		...BrandGradient,
	},
	inner: {
		flex: 1,
		overflow: "hidden",
		backgroundColor: Ink.surface,
	},
});
