import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ScaledFrame } from "@/components/scaled-frame";
import { Brand, Ink, MaxColumnWidth, Type } from "@/constants/theme";
import { useDesignScale } from "@/hooks/use-design-scale";

const LOGO_SIZE = 46;
const ILLUSTRATION_MAX_SCALE = 1.15;

/**
 * The artwork gets whatever height is left once the logo and the copy are laid
 * out, down to this floor. Past that the slide scrolls rather than clipping.
 */
const MIN_ILLUSTRATION_HEIGHT = 150;

/** Vertical rhythm from the artboard, tightened on shorter screens. */
const GAP = {
	logo: 40,
	illustration: 36,
	title: 24,
	body: 14,
} as const;

type OnboardingSlideProps = {
	title: string;
	body: string;
	illustration: ReactNode;
	illustrationFrame: { width: number; height: number };
	topInset: number;
	bottomInset: number;
};

export function OnboardingSlide({
	title,
	body,
	illustration,
	illustrationFrame,
	topInset,
	bottomInset,
}: OnboardingSlideProps) {
	const { vertical } = useDesignScale();

	return (
		<ScrollView
			style={styles.scroll}
			contentContainerStyle={[
				styles.content,
				{ paddingTop: topInset, paddingBottom: bottomInset },
			]}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.column}>
				<View style={[styles.logo, { marginTop: GAP.logo * vertical }]} />

				<ScaledFrame
					frame={illustrationFrame}
					maxScale={ILLUSTRATION_MAX_SCALE}
					style={[styles.illustration, { marginTop: GAP.illustration * vertical }]}
				>
					{illustration}
				</ScaledFrame>

				<Text style={[styles.title, { marginTop: GAP.title * vertical }]}>{title}</Text>
				<Text style={[styles.body, { marginTop: GAP.body * vertical }]}>{body}</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scroll: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		alignItems: "center",
	},
	column: {
		flexGrow: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignItems: "center",
		paddingHorizontal: 30,
	},
	logo: {
		width: LOGO_SIZE,
		height: LOGO_SIZE,
		borderRadius: 8,
		backgroundColor: Brand.purple,
	},
	illustration: {
		flex: 1,
		alignSelf: "stretch",
		minHeight: MIN_ILLUSTRATION_HEIGHT,
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
