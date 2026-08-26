import { Image } from "expo-image";
import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import PinSolidIcon from "@/assets/home/pin-solid.svg";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import type { SearchMeetup } from "@/features/search/search-catalog";
import { formatDistance, formatSchedule } from "@/utils/format";

const MEDIA_ASPECT = 361 / 180;
const PIN_SIZE = 14;
const JOIN_MIN_HEIGHT = 44;

export type MeetupCardProps = {
	meetup: SearchMeetup;
	hasJoined: boolean;
	isJoining: boolean;
	onOpen: (id: string) => void;
	onJoin: (id: string) => void;
};

export const MeetupCard = memo(function MeetupCard({
	meetup,
	hasJoined,
	isJoining,
	onOpen,
	onJoin,
}: MeetupCardProps) {
	const { id, title, venue, distanceKm, startsAt, photo, attendees, extraAttendees } = meetup;
	const schedule = formatSchedule(startsAt);
	const distance = formatDistance(distanceKm);
	const joinLabel = hasJoined ? "Joined" : isJoining ? "Joining" : "Join Meetup";
	const isJoinInert = hasJoined || isJoining;

	return (
		<View style={styles.card}>
			<Pressable
				accessibilityHint="Opens this meetup"
				accessibilityLabel={`${title}, at ${venue}, ${distance}, ${schedule}`}
				accessibilityRole="button"
				onPress={() => onOpen(id)}
				style={({ pressed }) => pressed && styles.pressed}
			>
				<Image
					accessibilityIgnoresInvertColors
					contentFit="cover"
					source={photo}
					style={styles.media}
					transition={200}
				/>

				<View style={styles.body}>
					<View style={styles.copy}>
						<Text numberOfLines={2} style={styles.title}>
							{title}
						</Text>

						<View style={styles.venueRow}>
							<PinSolidIcon color={Brand.purple} height={PIN_SIZE} width={PIN_SIZE} />

							<Text numberOfLines={1} style={styles.venue}>
								{venue}
							</Text>
						</View>

						<Text numberOfLines={1} style={styles.meta}>
							{distance}
						</Text>

						<Text numberOfLines={1} style={styles.meta}>
							{schedule}
						</Text>
					</View>

					<AvatarStack
						accessibilityLabel={`${attendees.length + extraAttendees} people going`}
						avatars={attendees}
						extraCount={extraAttendees}
					/>
				</View>
			</Pressable>

			<Pressable
				accessibilityHint={`Adds you to ${title}`}
				accessibilityLabel={`${joinLabel}, ${title}`}
				accessibilityRole="button"
				accessibilityState={{ disabled: isJoinInert, busy: isJoining }}
				disabled={isJoinInert}
				onPress={() => onJoin(id)}
				style={({ pressed }) => [
					styles.join,
					isJoinInert && styles.joinInert,
					pressed && !isJoinInert && styles.pressed,
				]}
			>
				<Text style={styles.joinLabel}>{joinLabel}</Text>
			</Pressable>
		</View>
	);
});

const styles = StyleSheet.create({
	card: {
		borderRadius: Radius.dialog,
		overflow: "hidden",
		backgroundColor: Ink.surface,
		...Platform.select({
			ios: {
				shadowColor: "#000000",
				shadowOpacity: 0.1,
				shadowRadius: 10,
				shadowOffset: { width: 0, height: 4 },
			},
			android: { elevation: 3 },
			default: {},
		}),
	},
	media: {
		width: "100%",
		aspectRatio: MEDIA_ASPECT,
		backgroundColor: Ink.border,
	},
	body: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
		padding: Gap.card,
	},
	copy: {
		flex: 1,
		gap: Spacing.half,
	},
	title: {
		...Type.resultName,
		color: Ink.title,
	},
	venueRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	venue: {
		...Type.resultMeta,
		flexShrink: 1,
		color: Brand.purple,
	},
	meta: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	join: {
		minHeight: Math.max(JOIN_MIN_HEIGHT, MinTapTarget),
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: Gap.card,
		marginBottom: Gap.card,
		borderRadius: Radius.control,
		borderWidth: 1,
		borderColor: Brand.purple,
	},
	joinInert: {
		borderColor: Ink.borderStrong,
	},
	joinLabel: {
		...Type.cta,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.85,
	},
});
