import { StyleSheet, Text, View } from "react-native";

import AlertCircleIcon from "@/assets/auth/alert-circle.svg";
import { Ink, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 16;

export type FormErrorBannerProps = {
	message: string;
};

/** Whole-form failures, as opposed to the per field errors `FormField` renders. */
export function FormErrorBanner({ message }: FormErrorBannerProps) {
	return (
		<View role="alert" style={styles.banner}>
			<AlertCircleIcon
				color={Ink.danger}
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
		paddingVertical: Spacing.two + Spacing.half,
		paddingHorizontal: Spacing.three - Spacing.one,
		borderWidth: 1,
		borderRadius: Radius.control,
		borderColor: Ink.danger,
		backgroundColor: Ink.surface,
	},
	// Nudged onto the first line's optical centre rather than its box top.
	icon: {
		marginTop: 1,
	},
	message: {
		...Type.fieldError,
		flex: 1,
		color: Ink.danger,
	},
});
