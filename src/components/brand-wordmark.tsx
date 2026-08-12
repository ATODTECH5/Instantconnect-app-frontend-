import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

import { Brand, BrandFont } from "@/constants/theme";

export const BRAND_NAME = "InstantConnect";

/**
 * The design applies a 1px outer stroke to thicken the glyphs. Abyssinica SIL
 * ships a single 400 weight, so a hairline shadow in the text colour is the
 * closest cross-platform stand-in for that stroke. react-native-web has
 * deprecated the `textShadow*` props in favour of the CSS shorthand, while
 * native still reads the long form.
 */
const GLYPH_STROKE = Platform.select({
	web: { textShadow: `0 0 1px ${Brand.onBrand}` } as TextStyle,
	default: {
		textShadowColor: Brand.onBrand,
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 1,
	} satisfies TextStyle,
});

export function BrandWordmark({ style, ...rest }: TextProps) {
	return (
		<Text
			{...rest}
			accessibilityRole="header"
			allowFontScaling={false}
			style={[styles.wordmark, style]}
		>
			{BRAND_NAME}
		</Text>
	);
}

const styles = StyleSheet.create({
	wordmark: {
		fontFamily: BrandFont,
		fontSize: 24,
		lineHeight: 32,
		letterSpacing: -0.3,
		textAlign: "center",
		color: Brand.onBrand,
		...GLYPH_STROKE,
	},
});
