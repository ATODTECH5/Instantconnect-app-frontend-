import { memo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import CloseIcon from "@/assets/search/close.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const AVATAR = 16;
const ICON = 12;
const CHIP_HEIGHT = 24;

export type PersonChipProps = {
	id: string;
	fullName: string;
	avatarUrl: string | null;
	onRemove: (id: string) => void;
};

/** A picked person, first name only, removed by tapping the chip. */
export const PersonChip = memo(function PersonChip({
	id,
	fullName,
	avatarUrl,
	onRemove,
}: PersonChipProps) {
	const firstName = fullName.split(" ")[0] ?? fullName;

	return (
		<Pressable
			accessibilityHint="Removes this person"
			accessibilityLabel={`Remove ${fullName}`}
			accessibilityRole="button"
			hitSlop={(MinTapTarget - CHIP_HEIGHT) / 2}
			onPress={() => onRemove(id)}
			style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
		>
			<AvatarImage fullName={fullName} size={AVATAR} uri={avatarUrl} />

			<Text numberOfLines={1} style={styles.label}>
				{firstName}
			</Text>

			<CloseIcon color={Brand.purple} height={ICON} width={ICON} />
		</Pressable>
	);
});

const styles = StyleSheet.create({
	chip: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
		minHeight: CHIP_HEIGHT,
		paddingHorizontal: Spacing.two,
		paddingVertical: Spacing.one,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurface,
	},
	label: {
		...Type.cardAction,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
