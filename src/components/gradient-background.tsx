import { StyleSheet, View, type ViewProps } from "react-native";

import { Brand, BrandGradient } from "@/constants/theme";

export function GradientBackground({ style, ...rest }: ViewProps) {
	return <View {...rest} style={[styles.gradient, style]} />;
}

const styles = StyleSheet.create({
	gradient: {
		backgroundColor: Brand.pink,
		...BrandGradient,
	},
});
