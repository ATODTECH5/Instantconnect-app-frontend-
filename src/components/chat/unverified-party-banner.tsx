import { StyleSheet, Text, View } from "react-native";

import ShieldIcon from "@/assets/settings/shield.svg";
import { Ink, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 16;

export type UnverifiedPartyBannerProps = {
	firstName: string;
};

/**
 * Shown to a verified member whose chat partner has not passed KYC. It stays
 * for the whole thread rather than being dismissible, because the advice
 * matters most later on, when a meetup or a money request comes up.
 */
export function UnverifiedPartyBanner({ firstName }: UnverifiedPartyBannerProps) {
	const message = `${firstName} has not verified their identity. For your safety, keep chats in the app, never send money or personal details, and meet in public places.`;

	return (
		<View accessibilityLabel={message} accessible role="alert" style={styles.banner}>
			<ShieldIcon
				color={Ink.pending}
				height={ICON_SIZE}
				style={styles.icon}
				width={ICON_SIZE}
			/>

			<Text style={styles.message}>{message}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	banner: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Spacing.two,
		marginHorizontal: Spacing.three,
		marginTop: Spacing.two,
		paddingVertical: Spacing.two,
		paddingHorizontal: Spacing.three - Spacing.one,
		borderWidth: 1,
		borderRadius: Radius.control,
		borderColor: Ink.warningBorder,
		backgroundColor: Ink.warningSurface,
	},
	// Nudged onto the first line's optical centre rather than its box top.
	icon: {
		marginTop: 1,
	},
	message: {
		...Type.fieldError,
		flex: 1,
		color: Ink.body,
	},
});
