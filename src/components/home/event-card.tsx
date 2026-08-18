import { Image } from "expo-image";
import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import PinSolidIcon from "@/assets/home/pin-solid.svg";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { NearbyEvent } from "@/features/home/home-feed";
import { formatPrice } from "@/utils/format";

export const EVENT_CARD_ASPECT = 228 / 165;

const MEDIA_ASPECT = 228 / 99;
const PIN_SIZE = 14;

export type EventCardProps = {
	event: NearbyEvent;
	width: number;
	onOpen: (id: string) => void;
};

export const EventCard = memo(function EventCard({ event, width, onOpen }: EventCardProps) {
	const { id, title, venue, priceMinor, currencySymbol, photo } = event;
	const price = formatPrice(priceMinor, currencySymbol);

	return (
		<Pressable
			accessibilityHint="Opens this event"
			accessibilityLabel={`${title}, at ${venue}, ${price}`}
			accessibilityRole="button"
			onPress={() => onOpen(id)}
			style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
		>
			<Image
				accessibilityIgnoresInvertColors
				contentFit="cover"
				source={photo}
				style={styles.media}
				transition={200}
			/>

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
		gap: Spacing.one,
		padding: Gap.snug,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	title: {
		...Type.cardName,
		flexShrink: 1,
		color: Ink.title,
	},
	price: {
		...Type.cardName,
		color: Ink.title,
	},
	venueRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	venue: {
		...Type.cardMeta,
		flexShrink: 1,
		color: Ink.meta,
	},
	pressed: {
		opacity: 0.85,
	},
});
