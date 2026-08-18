import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Gap, Ink, MaxContentWidth, NavBarHeight, Spacing } from "@/constants/theme";

const SUPPORTS_GLASS = isLiquidGlassAvailable();

export function NavBar({ children, style, ...rest }: ViewProps) {
	const insets = useSafeAreaInsets();
	const Surface = SUPPORTS_GLASS ? GlassView : View;

	return (
		<Surface
			{...rest}
			style={[
				styles.bar,
				SUPPORTS_GLASS ? styles.glass : styles.solid,
				{ paddingBottom: Gap.card + insets.bottom },
				style,
			]}
		>
			<View style={styles.row}>{children}</View>
		</Surface>
	);
}

const styles = StyleSheet.create({
	bar: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		paddingTop: Spacing.one,
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	glass: {
		backgroundColor: Ink.navGlass,
		borderTopColor: Ink.navBorder,
	},
	solid: {
		backgroundColor: Ink.navFallback,
		borderTopColor: Ink.border,
	},
	row: {
		flexDirection: "row",
		alignSelf: "center",
		width: "100%",
		maxWidth: MaxContentWidth,
		minHeight: NavBarHeight - Gap.card - Spacing.one,
	},
});
