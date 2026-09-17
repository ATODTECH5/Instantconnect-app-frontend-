import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";

const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 4;

export type TallSheetProps = {
	visible: boolean;
	title: string;
	/** Read to screen readers in place of the title, when the header is richer than text. */
	accessibilityLabel?: string;
	/** Replaces the plain title row, for the Live Chat sheet's avatar header. */
	header?: ReactNode;
	children: ReactNode;
	onDismiss: () => void;
};

/**
 * The near full height sheet the Help & Support frames open Help, Messages
 * and Live Chat in. `BottomSheet` stays the short confirmation sheet; this one
 * is for content. It is a native page sheet rather than a transparent modal,
 * because that is what gives iOS its swipe down to dismiss; the frames draw
 * a handle and no close control, so without the gesture there is no way out.
 */
export function TallSheet({
	visible,
	title,
	accessibilityLabel,
	header,
	children,
	onDismiss,
}: TallSheetProps) {
	const insets = useSafeAreaInsets();

	return (
		<Modal
			animationType="slide"
			onDismiss={onDismiss}
			onRequestClose={onDismiss}
			presentationStyle="pageSheet"
			visible={visible}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.scrim}
			>
				<View
					accessibilityLabel={accessibilityLabel ?? title}
					style={[styles.sheet, { paddingBottom: insets.bottom }]}
				>
					<View style={styles.handle} />

					{header ?? (
						<Text accessibilityRole="header" style={styles.title}>
							{title}
						</Text>
					)}

					<View style={styles.body}>{children}</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	scrim: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	sheet: {
		flex: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		gap: Spacing.three,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		backgroundColor: Ink.surface,
	},
	handle: {
		width: HANDLE_WIDTH,
		height: HANDLE_HEIGHT,
		alignSelf: "center",
		borderRadius: HANDLE_HEIGHT / 2,
		backgroundColor: Ink.bubbleIncoming,
	},
	title: {
		...Type.subtitle,
		color: Ink.title,
	},
	body: {
		flex: 1,
	},
});
