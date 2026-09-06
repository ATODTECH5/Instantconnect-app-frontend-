import { Image } from "expo-image";
import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import ArrowRightIcon from "@/assets/connections/arrow-right.svg";
import PinSolidIcon from "@/assets/home/pin-solid.svg";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { RegisteredEvent } from "@/features/connections/registered-events";
import { formatDistance, formatSchedule } from "@/utils/format";

const MEDIA_HEIGHT = 108;
const PIN = 10;
const ARROW = 12;
/** Faces beyond this collapse into the "+N" disc. */
const MAX_FACES = 3;

export type RegisteredEventCardProps = {
	event: RegisteredEvent;
	onOpen: (id: string) => void;
};

export const RegisteredEventCard = memo(function RegisteredEventCard({
	event,
	onOpen,
}: RegisteredEventCardProps) {
	const faces = event.attendees.slice(0, MAX_FACES).map((attendee) => attendee.avatar);
	const extra = Math.max(event.attendeeCount - faces.length, 0);

	return (
		<Pressable
			accessibilityHint="Opens this event"
			accessibilityLabel={`${event.title} at ${event.venue}. ${formatSchedule(
				event.startsAt,
			)}. ${event.attendeeCount} attending`}
			accessibilityRole="button"
			onPress={() => onOpen(event.id)}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
		>
			<View style={styles.media}>
				<Image
					accessibilityIgnoresInvertColors
					contentFit="cover"
					source={event.photo}
					style={StyleSheet.absoluteFill}
					transition={200}
				/>
			</View>

			<View style={styles.body}>
				<View style={styles.detailRow}>
					<View style={styles.copy}>
						<Text numberOfLines={2} style={styles.title}>
							{event.title}
						</Text>

						<View style={styles.venueRow}>
							<PinSolidIcon color={Brand.purple} height={PIN} width={PIN} />

							<Text numberOfLines={1} style={styles.venue}>
								{event.venue}
							</Text>
						</View>

						<Text style={styles.distance}>{formatDistance(event.distanceKm)}</Text>

						<Text style={styles.schedule}>{formatSchedule(event.startsAt)}</Text>
					</View>

					{faces.length > 0 ? (
						<AvatarStack
							accessibilityLabel={`${event.attendeeCount} attending`}
							avatars={faces}
							extraCount={extra}
						/>
					) : null}
				</View>

				<View style={styles.footer}>
					<Text style={styles.attending}>{event.attendeeCount} attending</Text>

					<View style={styles.action}>
						<Text style={styles.actionLabel}>View Ticket</Text>

						<ArrowRightIcon color={Brand.purple} height={ARROW} width={ARROW} />
					</View>
				</View>
			</View>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	card: {
		borderRadius: Radius.control,
		overflow: "hidden",
		backgroundColor: Ink.surface,
		...Platform.select({
			ios: {
				shadowColor: "#000000",
				shadowOpacity: 0.1,
				shadowRadius: 16,
				shadowOffset: { width: 0, height: -4 },
			},
			android: { elevation: 3 },
			default: {},
		}),
	},
	media: {
		height: MEDIA_HEIGHT,
		backgroundColor: Ink.border,
	},
	body: {
		gap: Gap.snug,
		padding: Spacing.two,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
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
		gap: Spacing.half,
	},
	venue: {
		...Type.sliderTick,
		flexShrink: 1,
		color: Ink.body,
	},
	distance: {
		...Type.sliderTick,
		color: Ink.muted,
	},
	schedule: {
		...Type.sliderTick,
		color: Ink.body,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	attending: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	action: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.half,
	},
	actionLabel: {
		...Type.sectionLink,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.85,
	},
});
