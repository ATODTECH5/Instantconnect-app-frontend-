import { StyleSheet, View } from "react-native";

import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { Ink } from "@/constants/theme";

/**
 * Fades the screen behind it and blocks touches while a request is in flight.
 * Renders nothing when idle so it costs nothing on the happy path.
 */
export function LoadingOverlay({ visible, label }: { visible: boolean; label: string }) {
	if (!visible) return null;

	return (
		<View
			accessibilityLabel={label}
			accessibilityLiveRegion="polite"
			accessibilityViewIsModal
			style={styles.overlay}
		>
			<GradientSpinner />
		</View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surfaceVeil,
	},
});
