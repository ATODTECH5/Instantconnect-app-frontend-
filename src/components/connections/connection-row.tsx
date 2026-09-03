import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ChevronRightIcon from "@/assets/profile/chevron-right.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Gap, Ink, MinTapTarget, Spacing, Type } from "@/constants/theme";

const AVATAR = 52;
const CHEVRON = 18;

export type ConnectionRowProps = {
	id: string;
	fullName: string;
	avatarUrl: string | null;
	meta: string;
	onOpen: (id: string) => void;
};

export const ConnectionRow = memo(function ConnectionRow({
	id,
	fullName,
	avatarUrl,
	meta,
	onOpen,
}: ConnectionRowProps) {
	return (
		<Pressable
			accessibilityHint="Opens this profile"
			accessibilityLabel={`${fullName}. ${meta}`}
			accessibilityRole="button"
			onPress={() => onOpen(id)}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			<AvatarImage fullName={fullName} size={AVATAR} uri={avatarUrl} />

			<View style={styles.copy}>
				<Text numberOfLines={1} style={styles.name}>
					{fullName}
				</Text>

				<Text numberOfLines={1} style={styles.meta}>
					{meta}
				</Text>
			</View>

			<ChevronRightIcon color={Ink.meta} height={CHEVRON} width={CHEVRON} />
		</Pressable>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget + Spacing.two,
		paddingVertical: Spacing.one,
	},
	copy: {
		flex: 1,
		gap: Spacing.one,
	},
	name: {
		...Type.resultName,
		color: Ink.title,
	},
	meta: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	pressed: {
		opacity: 0.7,
	},
});
