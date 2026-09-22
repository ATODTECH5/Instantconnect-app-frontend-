import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ShieldCheckIcon from "@/assets/subscription/shield-check.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import { messageTime } from "@/features/chat/message-time";
import type { ApiNotification } from "@/lib/api/notification-schema";

const AVATAR = 44;
const SYSTEM_ICON = 22;
const DOT = 8;

export type NotificationRowProps = {
	notification: ApiNotification;
	onPress: (notification: ApiNotification) => void;
};

export const NotificationRow = memo(function NotificationRow({
	notification,
	onPress,
}: NotificationRowProps) {
	const { title, body, actor, isRead, createdAt } = notification;
	const stamp = messageTime(createdAt);

	return (
		<Pressable
			accessibilityHint="Opens what this is about"
			accessibilityLabel={`${title}. ${body}. ${stamp}${isRead ? "" : ". Unread"}`}
			accessibilityRole="button"
			onPress={() => onPress(notification)}
			style={({ pressed }) => [
				styles.row,
				!isRead && styles.rowUnread,
				pressed && styles.pressed,
			]}
		>
			{actor ? (
				<AvatarImage fullName={actor.fullName} size={AVATAR} uri={actor.avatarUrl} />
			) : (
				// KYC decisions and anything else the system raises have no actor,
				// and initials of "?" read as a broken avatar rather than as us.
				<View style={styles.systemBadge}>
					<ShieldCheckIcon
						color={Brand.purple}
						height={SYSTEM_ICON}
						width={SYSTEM_ICON}
					/>
				</View>
			)}

			<View style={styles.copy}>
				<View style={styles.titleRow}>
					<Text numberOfLines={1} style={styles.title}>
						{title}
					</Text>

					<Text style={styles.stamp}>{stamp}</Text>
				</View>

				<Text numberOfLines={2} style={styles.body}>
					{body}
				</Text>
			</View>

			{/* Decorative: the accessible label already says "Unread". */}
			{!isRead ? <View accessible={false} style={styles.dot} /> : null}
		</Pressable>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget + Spacing.three,
		paddingVertical: Spacing.two,
		paddingHorizontal: Spacing.three,
		borderRadius: Spacing.three,
	},
	rowUnread: {
		backgroundColor: Ink.glassOnLight,
	},
	systemBadge: {
		width: AVATAR,
		height: AVATAR,
		borderRadius: Radius.pill,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	copy: {
		flex: 1,
		gap: Spacing.half,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.tight,
	},
	title: {
		...Type.resultName,
		flex: 1,
		color: Ink.title,
	},
	stamp: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	body: {
		...Type.resultMeta,
		color: Ink.body,
	},
	dot: {
		width: DOT,
		height: DOT,
		borderRadius: DOT / 2,
		backgroundColor: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
