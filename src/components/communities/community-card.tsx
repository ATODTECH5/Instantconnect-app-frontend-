import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import UsersIcon from "@/assets/communities/users.svg";
import ShieldIcon from "@/assets/settings/shield.svg";
import { AvatarStack } from "@/components/ui/avatar-stack";
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
import { communityMeta, memberCountLabel } from "@/features/communities/community-copy";
import type { ApiCommunitySummary } from "@/lib/api/community-schema";

const BADGE = 40;
const ICON = 20;

export type CommunityCardProps = {
	community: ApiCommunitySummary;
	onOpen: (id: string) => void;
};

/**
 * A community the viewer belongs to. The Safety Community is drawn on the
 * brand gradient with its OFFICIAL tag; every other one is a white card.
 */
export const CommunityCard = memo(function CommunityCard({
	community,
	onOpen,
}: CommunityCardProps) {
	const official = community.isOfficial;
	const faces = community.memberPreview;
	const extra = Math.max(0, community.memberCount - faces.length);
	const actionLabel = official ? "View Posts" : "Open";

	return (
		<Pressable
			accessibilityHint="Opens this community"
			accessibilityLabel={`${community.name}, ${memberCountLabel(community.memberCount)}`}
			accessibilityRole="button"
			onPress={() => onOpen(community.id)}
			style={({ pressed }) => [
				styles.card,
				official ? [styles.official, BrandGradient] : styles.regular,
				pressed && styles.pressed,
			]}
		>
			<View style={styles.header}>
				<View style={[styles.badge, official ? styles.badgeOnBrand : styles.badgeOnLight]}>
					{official ? (
						<ShieldIcon color={Brand.onBrand} height={ICON} width={ICON} />
					) : (
						<UsersIcon color={Brand.purple} height={ICON} width={ICON} />
					)}
				</View>

				<View style={styles.titleBlock}>
					<Text numberOfLines={1} style={[styles.name, official && styles.onBrand]}>
						{community.name}
					</Text>

					{official ? (
						<View style={styles.officialRow}>
							<View style={styles.officialTag}>
								<Text style={styles.officialTagLabel}>OFFICIAL</Text>
							</View>

							<Text numberOfLines={1} style={styles.officialMeta}>
								All users enrolled • Always active
							</Text>
						</View>
					) : (
						<Text numberOfLines={1} style={styles.meta}>
							{communityMeta(community)}
						</Text>
					)}
				</View>
			</View>

			{community.description ? (
				<Text
					numberOfLines={3}
					style={[styles.description, official && styles.onBrandMuted]}
				>
					{community.description}
				</Text>
			) : null}

			<View style={styles.footer}>
				{faces.length > 0 ? (
					<AvatarStack
						accessibilityLabel={memberCountLabel(community.memberCount)}
						extraCount={extra}
						people={faces}
					/>
				) : (
					<View />
				)}

				<View
					style={[styles.action, official ? styles.actionOnBrand : styles.actionOnLight]}
				>
					<Text style={[styles.actionLabel, official && styles.onBrand]}>
						{actionLabel}
					</Text>
				</View>
			</View>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	card: {
		gap: Gap.card,
		padding: Spacing.three,
		borderRadius: Radius.media,
		overflow: "hidden",
	},
	official: {
		backgroundColor: Brand.purple,
	},
	regular: {
		backgroundColor: Ink.surface,
		borderWidth: 1,
		borderColor: Ink.border,
		...Platform.select({
			ios: {
				shadowColor: Ink.title,
				shadowOpacity: 0.06,
				shadowRadius: 12,
				shadowOffset: { width: 0, height: 4 },
			},
			android: { elevation: 2 },
			default: {},
		}),
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
	},
	badge: {
		width: BADGE,
		height: BADGE,
		borderRadius: Radius.control,
		alignItems: "center",
		justifyContent: "center",
	},
	badgeOnBrand: {
		backgroundColor: Ink.glassOnBrand,
		borderWidth: 1,
		borderColor: Ink.glassOnBrandBorder,
	},
	badgeOnLight: {
		backgroundColor: Brand.purpleSurface,
	},
	titleBlock: {
		flex: 1,
		gap: Spacing.half,
	},
	name: {
		...Type.resultName,
		color: Ink.title,
	},
	onBrand: {
		color: Brand.onBrand,
	},
	onBrandMuted: {
		color: Ink.onBrandMuted,
	},
	meta: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	officialRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
	officialTag: {
		paddingHorizontal: Spacing.two,
		paddingVertical: Spacing.half,
		borderRadius: Spacing.one,
		backgroundColor: Ink.glassOnBrand,
	},
	officialTagLabel: {
		...Type.tagLabel,
		color: Brand.onBrand,
	},
	officialMeta: {
		...Type.resultMeta,
		flexShrink: 1,
		color: Ink.onBrandMuted,
	},
	description: {
		...Type.promoBody,
		color: Ink.body,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
	},
	action: {
		minHeight: MinTapTarget - Spacing.three,
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.control,
	},
	actionOnBrand: {
		backgroundColor: Ink.glassOnBrand,
	},
	actionOnLight: {
		backgroundColor: Brand.purpleSurface,
	},
	actionLabel: {
		...Type.cardAction,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.85,
	},
});
