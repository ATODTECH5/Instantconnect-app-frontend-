import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ArrowRightIcon from "@/assets/connections/arrow-right.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, BrandGradient, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

const AVATAR = 32;
const OVERLAP = -12;
const ARROW = 16;

export type ActiveMeetup = {
	id: string;
	partnerName: string;
	partnerAvatarUrl: string | null;
	viewerAvatarUrl: string | null;
	viewerName: string;
	venue: string;
};

export type MeetupBannerProps = {
	meetup: ActiveMeetup;
	onOpen: (id: string) => void;
};

/**
 * Entry point into the live meetup. Rendered only while a meetup is running,
 * which cannot happen until the meetup lifecycle exists, so today the caller
 * always passes null and this never mounts.
 */
export const MeetupBanner = memo(function MeetupBanner({ meetup, onOpen }: MeetupBannerProps) {
	return (
		<Pressable
			accessibilityHint="Opens the live meetup"
			accessibilityLabel={`Ongoing meetup active with ${meetup.partnerName} at ${meetup.venue}`}
			accessibilityRole="button"
			onPress={() => onOpen(meetup.id)}
			style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
		>
			<View style={styles.avatars}>
				<View style={[styles.avatar, styles.behind]}>
					<AvatarImage
						fullName={meetup.viewerName}
						size={AVATAR}
						uri={meetup.viewerAvatarUrl}
					/>
				</View>

				<View style={styles.avatar}>
					<AvatarImage
						fullName={meetup.partnerName}
						size={AVATAR}
						uri={meetup.partnerAvatarUrl}
					/>
				</View>
			</View>

			<View style={styles.copy}>
				<Text numberOfLines={1} style={styles.title}>
					Ongoing Meetup Active
				</Text>

				<Text numberOfLines={1} style={styles.subtitle}>
					{meetup.partnerName} • {meetup.venue}
				</Text>
			</View>

			<ArrowRightIcon color={Brand.onBrand} height={ARROW} width={ARROW} />
		</Pressable>
	);
});

const styles = StyleSheet.create({
	banner: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		padding: Gap.card,
		borderRadius: Radius.control,
		...BrandGradient,
	},
	avatars: {
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		borderRadius: AVATAR / 2,
		borderWidth: StyleSheet.hairlineWidth * 2,
		borderColor: Brand.onBrand,
		overflow: "hidden",
	},
	behind: {
		marginRight: OVERLAP,
	},
	copy: {
		flex: 1,
		gap: Spacing.half,
	},
	title: {
		...Type.cardName,
		color: Brand.onBrand,
	},
	subtitle: {
		...Type.cardMeta,
		color: Ink.onMediaMuted,
	},
	pressed: {
		opacity: 0.85,
	},
});
