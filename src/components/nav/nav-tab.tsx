import type { TabTriggerSlotProps } from "expo-router/ui";
import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { Brand, BrandGradient, Gap, Ink, MinTapTarget, Type } from "@/constants/theme";

const ICON_SIZE = 22;
const FAB_SIZE = 56;
const FAB_RING = 4;
const FAB_ICON = 24;

export type NavTabProps = TabTriggerSlotProps & {
	Icon: FC<SvgProps>;
	label: string;
	floating?: boolean;
};

export function NavTab({
	Icon,
	label,
	floating = false,
	isFocused = false,
	children: _children,
	...rest
}: NavTabProps) {
	if (floating) {
		return (
			<Pressable
				{...rest}
				accessibilityLabel={label}
				accessibilityRole="button"
				accessibilityState={{ selected: isFocused }}
				style={styles.floatingSlot}
			>
				{({ pressed }) => (
					<View style={[styles.fab, pressed && styles.pressed]}>
						<Icon color={Brand.onBrand} height={FAB_ICON} width={FAB_ICON} />
					</View>
				)}
			</Pressable>
		);
	}

	return (
		<Pressable
			{...rest}
			accessibilityLabel={label}
			accessibilityRole="tab"
			accessibilityState={{ selected: isFocused }}
			style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
		>
			<Icon
				color={isFocused ? Brand.purple : Ink.label}
				height={ICON_SIZE}
				width={ICON_SIZE}
			/>

			<Text numberOfLines={1} style={[styles.label, isFocused && styles.labelFocused]}>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	slot: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Gap.tight,
		minHeight: MinTapTarget,
	},
	floatingSlot: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-start",
	},
	fab: {
		width: FAB_SIZE,
		height: FAB_SIZE,
		borderRadius: FAB_SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: FAB_RING,
		borderColor: Ink.surface,
		backgroundColor: Brand.pink,
		...BrandGradient,
	},
	label: {
		...Type.tabLabel,
		color: Ink.label,
	},
	labelFocused: {
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
