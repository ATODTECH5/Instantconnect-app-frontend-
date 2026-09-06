import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";

const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 4;
const BADGE = 56;

export type BottomSheetProps = {
	visible: boolean;
	title: string;
	message: ReactNode;
	icon: ReactNode;
	/** Fill behind the icon, so a sheet can read as danger, success or brand. */
	badgeColor?: string;
	/** Reason chips and anything else between the message and the actions. */
	children?: ReactNode;
	actions: ReactNode;
	onDismiss: () => void;
};

/**
 * Slides up from the foot of the screen, unlike `Dialog`, which centres. The
 * meetup and attendance flows are designed as sheets so the screen behind stays
 * partly visible and the action reads as reversible.
 */
export function BottomSheet({
	visible,
	title,
	message,
	icon,
	badgeColor,
	children,
	actions,
	onDismiss,
}: BottomSheetProps) {
	return (
		<Modal
			animationType="slide"
			onRequestClose={onDismiss}
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<View style={styles.scrim}>
				<Pressable
					accessibilityLabel="Dismiss"
					accessibilityRole="button"
					onPress={onDismiss}
					style={styles.backdrop}
				/>

				<View accessibilityRole="alert" accessibilityViewIsModal style={styles.sheet}>
					<View style={styles.handle} />

					<View
						style={[styles.badge, badgeColor ? { backgroundColor: badgeColor } : null]}
					>
						{icon}
					</View>

					<Text accessibilityRole="header" style={styles.title}>
						{title}
					</Text>

					{typeof message === "string" ? (
						<Text style={styles.message}>{message}</Text>
					) : (
						message
					)}

					{children}

					<View style={styles.actions}>{actions}</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	scrim: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: Ink.scrim,
	},
	backdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sheet: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		alignItems: "center",
		gap: Spacing.three,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		paddingBottom: Spacing.six,
		borderTopLeftRadius: Radius.sheet,
		borderTopRightRadius: Radius.sheet,
		backgroundColor: Ink.surface,
	},
	handle: {
		width: HANDLE_WIDTH,
		height: HANDLE_HEIGHT,
		borderRadius: HANDLE_HEIGHT / 2,
		backgroundColor: Ink.border,
	},
	badge: {
		width: BADGE,
		height: BADGE,
		borderRadius: BADGE / 2,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		...Type.dialogTitle,
		color: Ink.title,
		textAlign: "center",
	},
	message: {
		...Type.dialogBody,
		color: Ink.muted,
		textAlign: "center",
	},
	actions: {
		width: "100%",
		gap: Spacing.two,
	},
});
