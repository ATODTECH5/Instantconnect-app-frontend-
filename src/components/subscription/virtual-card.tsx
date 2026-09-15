import { StyleSheet, View } from "react-native";

import { BrandGradient, Radius } from "@/constants/theme";

const CARD_HEIGHT = 175;
const CARD_SHADOW = "0px 8px 20px rgba(147, 51, 234, 0.19)";

/**
 * The gradient plate above the card form. The frame draws it blank, a brand
 * surface rather than a rendering of the card being typed, so nothing is
 * printed on it.
 */
export function VirtualCard() {
	return (
		<View
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			style={styles.card}
		/>
	);
}

const styles = StyleSheet.create({
	card: {
		height: CARD_HEIGHT,
		borderRadius: Radius.media,
		boxShadow: CARD_SHADOW,
		...BrandGradient,
	},
});
