import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import DoodleIcon from "@/assets/referrals/hero-doodle.svg";
import { BrandGradient, Gap, Ink, Radius, Type } from "@/constants/theme";

const HEIGHT = 141;
const BLOB = 100;
const DOODLE_WIDTH = 29;
const DOODLE_HEIGHT = 34;

/**
 * The gradient banner on the Refer a Friend intro (Figma 3051:1036). The two
 * portrait blobs and the doodle keep the frame's offsets and tilts; the title
 * takes whatever width is left of them.
 */
export function ReferralHero() {
	return (
		<View style={styles.banner}>
			<Text style={styles.title}>Share the vibe, grow the tribe</Text>

			<View style={styles.art}>
				<Image
					accessibilityIgnoresInvertColors
					contentFit="contain"
					source={require("@/assets/referrals/hero-blob-2.png")}
					style={[styles.blob, styles.blobBack]}
				/>

				<Image
					accessibilityIgnoresInvertColors
					contentFit="contain"
					source={require("@/assets/referrals/hero-blob-1.png")}
					style={[styles.blob, styles.blobFront]}
				/>

				<View style={styles.doodle}>
					<DoodleIcon color={Ink.surface} height={DOODLE_HEIGHT} width={DOODLE_WIDTH} />
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	banner: {
		...BrandGradient,
		height: HEIGHT,
		flexDirection: "row",
		borderRadius: Radius.dialog,
		overflow: "hidden",
		paddingLeft: Gap.card,
		paddingTop: 26,
	},
	title: {
		...Type.dialogTitle,
		fontFamily: Type.cta.fontFamily,
		fontSize: 23,
		lineHeight: 30,
		width: "46%",
		color: Ink.keypad,
	},
	art: {
		flex: 1,
	},
	blob: {
		position: "absolute",
		width: BLOB,
		height: BLOB,
	},
	blobBack: {
		top: -6,
		left: 6,
		transform: [{ rotate: "7deg" }],
	},
	blobFront: {
		top: -4,
		right: 4,
		transform: [{ rotate: "-13deg" }],
	},
	doodle: {
		position: "absolute",
		top: -22,
		right: 36,
		transform: [{ rotate: "49deg" }],
	},
});
