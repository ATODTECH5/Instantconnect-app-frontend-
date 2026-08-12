import type { ReactNode } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { Brand, Ink, Type } from "@/constants/theme";

/** Every measurement in the onboarding frames is relative to this width. */
const DESIGN_WIDTH = 393;

/**
 * Vertical anchors read off the three exports. The title and body sit at the
 * same y on every slide, so they are pinned here and only the artwork moves.
 * Offsets are measured down from the safe area rather than the frame top.
 */
const DESIGN = {
	safeTop: 59,
	logoTop: 99,
	logoSize: 46,
	titleInk: 555,
	bodyInk: 645,
} as const;

/** Distance from a text block's box top to the first painted pixel. */
const TITLE_INK_OFFSET = 8;
const BODY_INK_OFFSET = 5;
const TITLE_BLOCK_HEIGHT = Type.slideTitle.lineHeight * 2;

type OnboardingSlideProps = {
	title: string;
	body: string;
	illustration: ReactNode;
	/** Top edge of the artwork in design space. */
	illustrationTop: number;
	illustrationHeight: number;
	safeTop: number;
};

export function OnboardingSlide({
	title,
	body,
	illustration,
	illustrationTop,
	illustrationHeight,
	safeTop,
}: OnboardingSlideProps) {
	const { width } = useWindowDimensions();
	const scale = width / DESIGN_WIDTH;

	const logoGap = DESIGN.logoTop - DESIGN.safeTop;
	const illustrationGap = illustrationTop - (DESIGN.logoTop + DESIGN.logoSize);
	const titleGap = DESIGN.titleInk - (illustrationTop + illustrationHeight) - TITLE_INK_OFFSET;
	const bodyGap =
		DESIGN.bodyInk -
		BODY_INK_OFFSET -
		(DESIGN.titleInk - TITLE_INK_OFFSET + TITLE_BLOCK_HEIGHT);

	return (
		<View style={[styles.slide, { width, paddingTop: safeTop }]}>
			<View style={[styles.logo, { marginTop: logoGap * scale }]} />

			<View
				style={{
					height: illustrationHeight * scale,
					marginTop: illustrationGap * scale,
					justifyContent: "center",
				}}
			>
				<View style={{ transform: [{ scale }] }}>{illustration}</View>
			</View>

			<Text style={[styles.title, { marginTop: titleGap * scale }]}>{title}</Text>
			<Text style={[styles.body, { marginTop: bodyGap * scale }]}>{body}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	slide: {
		alignItems: "center",
		paddingHorizontal: 30,
	},
	logo: {
		width: DESIGN.logoSize,
		height: DESIGN.logoSize,
		borderRadius: 8,
		backgroundColor: Brand.purple,
	},
	title: {
		...Type.slideTitle,
		color: Ink.title,
		textAlign: "center",
	},
	body: {
		...Type.slideBody,
		color: Ink.body,
		textAlign: "center",
	},
});
