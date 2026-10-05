import { Image } from "expo-image";
import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import PinSolidIcon from "@/assets/home/pin-solid.svg";
import { RegisterLink } from "@/components/events/register-link";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { SearchEvent } from "@/features/search/search-catalog";
import { formatDistance, formatPrice, formatSchedule } from "@/utils/format";

const MEDIA_ASPECT = 361 / 180;
const PIN_SIZE = 14;

export type EventResultCardProps = {
	event: SearchEvent;
	onOpen: (id: string) => void;
};

/** The frame's Join Meetup button is left off: joining an event is not built yet. */
export const EventResultCard = memo(function EventResultCard({
	event,
	onOpen,
}: EventResultCardProps) {
	const { id, title, distanceKm, startsAt, coverUrl, priceMinor } = event;
	const venue = event.venue.name;
	const schedule = formatSchedule(startsAt);
	const distance = formatDistance(distanceKm);
	const price = formatPrice(priceMinor / 100, "₦");

	return (
		<Pressable
			accessibilityHint="Opens this event"
			accessibilityLabel={`${title}, at ${venue}, ${distance}, ${schedule}, ${price}`}
			accessibilityRole="button"
			onPress={() => onOpen(id)}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
		>
			<View style={styles.media}>
				{coverUrl ? (
					<Image
						accessibilityIgnoresInvertColors
						contentFit="cover"
						source={{ uri: coverUrl }}
						style={StyleSheet.absoluteFill}
						transition={200}
					/>
				) : null}
			</View>

			<View style={styles.body}>
				<View style={styles.titleRow}>
					<Text numberOfLines={2} style={styles.title}>
						{title}
					</Text>

					<Text style={styles.price}>{price}</Text>
				</View>

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

				<RegisterLink event={event} />
			</View>
		</Pressable>
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
		gap: Spacing.half,
		padding: Gap.card,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	title: {
		...Type.resultName,
		flexShrink: 1,
		color: Ink.title,
	},
	price: {
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
	pressed: {
		opacity: 0.85,
	},
});
