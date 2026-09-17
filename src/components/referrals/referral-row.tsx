import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AvatarImage } from "@/components/ui/avatar-image";
import { Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { ApiReferral } from "@/lib/api/referrals-schema";
import { formatTimeAgo } from "@/utils/format";

const AVATAR = 36;

export type ReferralRowProps = {
	referral: ApiReferral;
	/** Only a joined referral has a celebration to open. */
	onPress?: (referral: ApiReferral) => void;
};

function describe(referral: ApiReferral): string {
	return referral.status === "joined" && referral.joinedAt
		? `Registered ${formatTimeAgo(referral.joinedAt)}`
		: `Signed up ${formatTimeAgo(referral.invitedAt)}, verifying`;
}

/** One line of Referral History (Figma 3051:1536), with its Joined or Pending badge. */
export const ReferralRow = memo(function ReferralRow({ referral, onPress }: ReferralRowProps) {
	const joined = referral.status === "joined";

	return (
		<Pressable
			accessibilityHint={onPress ? "Opens what you both unlocked" : undefined}
			accessibilityLabel={`${referral.fullName}, ${joined ? "joined" : "pending"}`}
			accessibilityRole={onPress ? "button" : "text"}
			disabled={!onPress}
			onPress={() => onPress?.(referral)}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			<AvatarImage fullName={referral.fullName} size={AVATAR} uri={referral.avatarUrl} />

			<View style={styles.text}>
				<Text numberOfLines={1} style={styles.name}>
					{referral.fullName}
				</Text>

				<Text numberOfLines={1} style={styles.meta}>
					{describe(referral)}
				</Text>
			</View>

			<View style={[styles.badge, joined ? styles.badgeJoined : styles.badgePending]}>
				<Text style={[styles.badgeLabel, joined ? styles.labelJoined : styles.labelPending]}>
					{joined ? "Joined" : "Pending"}
				</Text>
			</View>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		padding: Gap.card,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.surface,
	},
	text: {
		flex: 1,
		gap: Spacing.half,
	},
	name: {
		...Type.docSection,
		color: Ink.body,
	},
	meta: {
		...Type.cardMeta,
		color: Ink.muted,
	},
	badge: {
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.one,
		borderWidth: 1,
		borderRadius: Radius.control,
	},
	badgeJoined: {
		borderColor: Ink.successBorder,
		backgroundColor: Ink.successSurface,
	},
	badgePending: {
		borderColor: Ink.warning,
		backgroundColor: Ink.warningBorder,
	},
	badgeLabel: {
		...Type.tagLabel,
	},
	labelJoined: {
		color: Ink.success,
	},
	labelPending: {
		color: Ink.warning,
	},
	pressed: {
		opacity: 0.7,
	},
});
