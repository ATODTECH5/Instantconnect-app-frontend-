import { Pressable, StyleSheet, Text, View } from "react-native";

import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

export type StateMessageProps = {
	message: string;
	actionLabel?: string;
	onPressAction?: () => void;
	isError?: boolean;
};

export function StateMessage({
	message,
	actionLabel,
	onPressAction,
	isError = false,
}: StateMessageProps) {
	return (
		<View
			accessibilityLiveRegion="polite"
			role={isError ? "alert" : undefined}
			style={styles.box}
		>
			<Text style={styles.message}>{message}</Text>

			{actionLabel && onPressAction ? (
				<Pressable
					accessibilityLabel={actionLabel}
					accessibilityRole="button"
					onPress={onPressAction}
					style={({ pressed }) => [styles.action, pressed && styles.pressed]}
				>
					<Text style={styles.actionLabel}>{actionLabel}</Text>
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		alignItems: "center",
		gap: Gap.card,
		padding: Spacing.four,
		borderRadius: Radius.dialog,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	message: {
		...Type.promoBody,
		color: Ink.muted,
		textAlign: "center",
	},
	action: {
		justifyContent: "center",
		minHeight: MinTapTarget,
		paddingHorizontal: Spacing.four,
		borderRadius: Radius.control,
		borderWidth: 1,
		borderColor: Brand.purple,
	},
	actionLabel: {
		...Type.cta,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
