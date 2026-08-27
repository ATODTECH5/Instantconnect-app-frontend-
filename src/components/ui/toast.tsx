import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AlertIcon from "@/assets/auth/alert-circle.svg";
import CloseIcon from "@/assets/search/close.svg";
import { Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";

const ICON_SIZE = 18;
const CLOSE_SIZE = 16;
const AUTO_DISMISS_MS = 4000;

export type ToastProps = {
	message: string;
	tone?: "success" | "error";
	onDismiss: () => void;
	/** Errors stay put, since the user may need to read and act on them. */
	autoDismiss?: boolean;
};

export function Toast({
	message,
	tone = "success",
	onDismiss,
	autoDismiss = tone === "success",
}: ToastProps) {
	useEffect(() => {
		if (!autoDismiss) return;

		const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);

		return () => clearTimeout(timer);
	}, [autoDismiss, onDismiss, message]);

	const isError = tone === "error";

	return (
		<View
			accessibilityLiveRegion="polite"
			role={isError ? "alert" : "status"}
			style={[styles.box, isError && styles.errorBox]}
		>
			<AlertIcon
				color={isError ? Ink.danger : Ink.success}
				height={ICON_SIZE}
				width={ICON_SIZE}
			/>

			<Text style={[styles.message, isError && styles.errorMessage]}>{message}</Text>

			<Pressable
				accessibilityLabel="Dismiss"
				accessibilityRole="button"
				hitSlop={12}
				onPress={onDismiss}
				style={({ pressed }) => [styles.close, pressed && styles.pressed]}
			>
				<CloseIcon color={Ink.placeholder} height={CLOSE_SIZE} width={CLOSE_SIZE} />
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingVertical: Gap.card,
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.control,
		borderWidth: 1,
		borderColor: Ink.successBorder,
		backgroundColor: Ink.successSurface,
	},
	errorBox: {
		borderColor: Ink.danger,
		backgroundColor: Ink.dangerSurface,
	},
	message: {
		...Type.toastLabel,
		flex: 1,
		color: Ink.success,
	},
	errorMessage: {
		color: Ink.danger,
	},
	close: {
		paddingLeft: Gap.snug,
		borderLeftWidth: 1,
		borderLeftColor: Ink.border,
	},
	pressed: {
		opacity: 0.6,
	},
});
