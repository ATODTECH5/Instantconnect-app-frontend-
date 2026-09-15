import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import InfoIcon from "@/assets/settings/info.svg";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

const DISC_SIZE = 18;
const ICON_SIZE = 11;
const BANNER_ICON_SIZE = 20;

export type InfoNoticeProps = {
	message: string;
	/**
	 * The Blocked Users frame draws the same notice larger, with a shield
	 * instead of the info glyph and no disc behind it.
	 */
	Icon?: FC<SvgProps>;
};

/** The pale purple explanatory box under a form. */
export function InfoNotice({ message, Icon }: InfoNoticeProps) {
	return (
		<View style={[styles.box, Icon && styles.boxBanner]}>
			{Icon ? (
				<Icon color={Brand.purple} height={BANNER_ICON_SIZE} width={BANNER_ICON_SIZE} />
			) : (
				<View style={styles.disc}>
					<InfoIcon color={Brand.purple} height={ICON_SIZE} width={ICON_SIZE} />
				</View>
			)}

			<Text style={[styles.message, Icon && styles.messageBanner]}>{message}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Gap.snug,
		padding: Gap.card,
		borderWidth: 1,
		borderColor: Brand.purpleSurface,
		borderRadius: Gap.snug,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	boxBanner: {
		borderColor: Ink.border,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.keypad,
	},
	disc: {
		width: DISC_SIZE,
		height: DISC_SIZE,
		borderRadius: DISC_SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surface,
	},
	message: {
		...Type.badgeLabel,
		fontFamily: Type.footnote.fontFamily,
		flex: 1,
		lineHeight: 16,
		color: Ink.muted,
	},
	messageBanner: {
		...Type.resultMeta,
		color: Ink.muted,
		paddingTop: Spacing.half,
	},
});
