import { Image } from "expo-image";
import { memo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import HashIcon from "@/assets/communities/hash.svg";
import ChevronRightIcon from "@/assets/profile/chevron-right.svg";
import {
	Brand,
	BrandGradient,
	Gap,
	Ink,
	MinTapTarget,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import { communityInitials, memberCountLabel } from "@/features/communities/community-copy";
import type { ApiCommunitySummary } from "@/lib/api/community-schema";

const THUMB = 56;
const BADGE = 44;
const ICON = 20;
const CHEVRON = 16;

export type CommunityRowProps = {
	community: ApiCommunitySummary;
	onOpen: (id: string) => void;
	/**
	 * "join" for a suggestion the viewer is not in: a hash badge and a Join
	 * button. "open" for My Groups and All: the cover thumbnail and a chevron.
	 */
	variant: "join" | "open";
	onJoin?: (id: string) => void;
	isJoining?: boolean;
};

export const CommunityRow = memo(function CommunityRow({
	community,
	onOpen,
	variant,
	onJoin,
	isJoining = false,
}: CommunityRowProps) {
	const subtitle = [
		memberCountLabel(community.memberCount),
		variant === "join" ? community.description : community.category?.label,
	]
		.filter(Boolean)
		.join(" • ");
	const canJoin = variant === "join" && !community.viewer.isMember && onJoin;

	return (
		<Pressable
			accessibilityHint="Opens this community"
			accessibilityLabel={`${community.name}, ${subtitle}`}
			accessibilityRole="button"
			onPress={() => onOpen(community.id)}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			{variant === "join" ? (
				<View style={styles.badge}>
					<HashIcon color={Brand.purple} height={ICON} width={ICON} />
				</View>
			) : community.coverUrl ? (
				<Image
					accessibilityIgnoresInvertColors
					contentFit="cover"
					source={{ uri: community.coverUrl }}
					style={styles.thumb}
					transition={200}
				/>
			) : (
				<View style={[styles.thumb, styles.initials, BrandGradient]}>
					<Text style={styles.initialsLabel}>{communityInitials(community.name)}</Text>
				</View>
			)}

			<View style={styles.copy}>
				<Text numberOfLines={1} style={styles.name}>
					{community.name}
				</Text>

				<Text numberOfLines={1} style={styles.meta}>
					{subtitle}
				</Text>
			</View>

			{canJoin ? (
				<Pressable
					accessibilityLabel={`Join ${community.name}`}
					accessibilityRole="button"
					accessibilityState={{ busy: isJoining, disabled: isJoining }}
					disabled={isJoining}
					hitSlop={Spacing.two}
					onPress={() => onJoin(community.id)}
					style={({ pressed }) => [styles.join, pressed && styles.pressed]}
				>
					{isJoining ? (
						<ActivityIndicator color={Brand.onBrand} size="small" />
					) : (
						<Text style={styles.joinLabel}>Join</Text>
					)}
				</Pressable>
			) : (
				<ChevronRightIcon color={Ink.meta} height={CHEVRON} width={CHEVRON} />
			)}
		</Pressable>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		padding: Gap.card,
		borderRadius: Radius.media,
		borderWidth: 1,
		borderColor: Ink.border,
		backgroundColor: Ink.surface,
	},
	badge: {
		width: BADGE,
		height: BADGE,
		borderRadius: Radius.control,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	thumb: {
		width: THUMB,
		height: THUMB,
		borderRadius: Radius.control,
		backgroundColor: Ink.border,
	},
	initials: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purple,
	},
	initialsLabel: {
		...Type.resultName,
		color: Brand.onBrand,
	},
	copy: {
		flex: 1,
		gap: Spacing.half,
	},
	name: {
		...Type.resultName,
		color: Ink.title,
	},
	meta: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	join: {
		minWidth: 64,
		minHeight: MinTapTarget - Spacing.three,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.control,
		backgroundColor: Brand.purple,
	},
	joinLabel: {
		...Type.cardAction,
		color: Brand.onBrand,
	},
	pressed: {
		opacity: 0.85,
	},
});
