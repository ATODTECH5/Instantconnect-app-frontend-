import { Pressable, StyleSheet, Text, View } from "react-native";

import BellIcon from "@/assets/home/bell.svg";
import PinIcon from "@/assets/home/pin.svg";
import { IconButton } from "@/components/ui/icon-button";
import { PresenceAvatar } from "@/components/ui/presence-avatar";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const AVATAR_SIZE = 40;
const PIN_SIZE = 20;
const BELL_CHIP = 32;
const SIDE_SLOT = MinTapTarget;

export type HomeHeaderProps = {
	avatarUrl: string | null;
	fullName: string;
	isOnline: boolean;
	place: string;
	unreadCount: number;
	onOpenProfile: () => void;
	onChangePlace: () => void;
	onOpenNotifications: () => void;
};

export function HomeHeader({
	avatarUrl,
	fullName,
	isOnline,
	place,
	unreadCount,
	onOpenProfile,
	onChangePlace,
	onOpenNotifications,
}: HomeHeaderProps) {
	return (
		<View style={styles.row}>
			<View style={styles.slot}>
				<Pressable
					accessibilityHint="Opens your profile"
					accessibilityLabel="Your profile"
					accessibilityRole="button"
					hitSlop={Spacing.two}
					onPress={onOpenProfile}
					style={({ pressed }) => pressed && styles.pressed}
				>
					<PresenceAvatar
						fullName={fullName}
						isOnline={isOnline}
						size={AVATAR_SIZE}
						uri={avatarUrl}
					/>
				</Pressable>
			</View>

			<Pressable
				accessibilityHint="Changes the area you are browsing"
				accessibilityLabel={`Current area, ${place}`}
				accessibilityRole="button"
				onPress={onChangePlace}
				style={({ pressed }) => [styles.place, pressed && styles.pressed]}
			>
				<PinIcon color={Brand.purple} height={PIN_SIZE} width={PIN_SIZE} />

				<Text numberOfLines={1} style={styles.placeLabel}>
					{place}
				</Text>
			</Pressable>

			<View style={[styles.slot, styles.slotEnd]}>
				<IconButton
					Icon={BellIcon}
					accessibilityHint="Opens your notifications"
					accessibilityLabel="Notifications"
					badgeCount={unreadCount}
					height={BELL_CHIP}
					onPress={onOpenNotifications}
					radius={Radius.control}
					width={BELL_CHIP}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
	slot: {
		width: SIDE_SLOT,
		alignItems: "flex-start",
	},
	slotEnd: {
		alignItems: "flex-end",
	},
	place: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Gap.tight,
		minHeight: MinTapTarget,
	},
	placeLabel: {
		...Type.placeLabel,
		flexShrink: 1,
		color: Ink.title,
	},
	pressed: {
		opacity: 0.7,
	},
});
