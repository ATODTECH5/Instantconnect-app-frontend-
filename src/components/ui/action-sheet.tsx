import type { FC } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import {
	Brand,
	Gap,
	Ink,
	MaxColumnWidth,
	MinTapTarget,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";

const ICON = 20;
const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 4;

export type ActionSheetItem = {
	key: string;
	label: string;
	Icon: FC<SvgProps>;
	/** Red, for reporting and deleting. */
	destructive?: boolean;
	/** Closing the sheet is up to the item, since some open a follow-up. */
	onPress: () => void;
};

export type ActionSheetProps = {
	visible: boolean;
	items: ActionSheetItem[];
	onDismiss: () => void;
};

/** A list of actions above a separate Cancel, the iOS action sheet shape. */
export function ActionSheet({ visible, items, onDismiss }: ActionSheetProps) {
	const insets = useSafeAreaInsets();

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
					style={StyleSheet.absoluteFill}
				/>

				<View
					accessibilityViewIsModal
					style={[styles.column, { paddingBottom: insets.bottom + Spacing.three }]}
				>
					<View style={styles.group}>
						<View style={styles.handle} />

						{items.map(({ key, label, Icon, destructive, onPress }, index) => (
							<Pressable
								accessibilityLabel={label}
								accessibilityRole="button"
								key={key}
								onPress={onPress}
								style={({ pressed }) => [
									styles.item,
									index > 0 && styles.divider,
									pressed && styles.pressed,
								]}
							>
								<Icon
									color={destructive ? Ink.danger : Ink.body}
									height={ICON}
									width={ICON}
								/>

								<Text style={[styles.label, destructive && styles.danger]}>
									{label}
								</Text>
							</Pressable>
						))}
					</View>

					<Pressable
						accessibilityLabel="Cancel"
						accessibilityRole="button"
						onPress={onDismiss}
						style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
					>
						<Text style={styles.cancelLabel}>Cancel</Text>
					</Pressable>
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
	column: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		gap: Gap.snug,
		paddingHorizontal: Spacing.three,
	},
	group: {
		paddingTop: Spacing.two,
		borderRadius: Radius.sheet,
		backgroundColor: Ink.surface,
		overflow: "hidden",
	},
	handle: {
		width: HANDLE_WIDTH,
		height: HANDLE_HEIGHT,
		borderRadius: HANDLE_HEIGHT / 2,
		alignSelf: "center",
		marginBottom: Spacing.two,
		backgroundColor: Ink.bubbleIncoming,
	},
	item: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget,
		paddingHorizontal: Spacing.three + Spacing.one,
	},
	divider: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Ink.border,
	},
	label: {
		...Type.menuLabel,
		color: Ink.body,
	},
	danger: {
		color: Ink.danger,
	},
	cancel: {
		minHeight: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Radius.sheet,
		backgroundColor: Ink.surface,
	},
	cancelLabel: {
		...Type.cta,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
