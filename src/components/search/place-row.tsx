import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import StarIcon from "@/assets/search/star.svg";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { SearchPlace } from "@/features/search/search-catalog";
import { formatRating, formatWalk } from "@/utils/format";

const THUMB_WIDTH = 64;
const THUMB_HEIGHT = 48;
const STAR = 14;

export type PlaceRowProps = {
	place: SearchPlace;
	onOpen: (id: string) => void;
};

/** Serves the Places, Restaurant and Work Space sections alike. */
export const PlaceRow = memo(function PlaceRow({ place, onOpen }: PlaceRowProps) {
	const { id, name, distanceMetres, walkMinutes, rating, area, photo } = place;
	const walk = formatWalk(distanceMetres, walkMinutes);
	const score = formatRating(rating, area);

	return (
		<Pressable
			accessibilityHint="Opens this place"
			accessibilityLabel={`${name}. ${walk}. Rated ${score}`}
			accessibilityRole="button"
			onPress={() => onOpen(id)}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			<Image
				accessibilityIgnoresInvertColors
				contentFit="cover"
				source={photo}
				style={styles.thumb}
				transition={200}
			/>

			<View style={styles.copy}>
				<Text numberOfLines={1} style={styles.name}>
					{name}
				</Text>

				<Text numberOfLines={1} style={styles.meta}>
					{walk}
				</Text>

				<View style={styles.ratingRow}>
					<StarIcon color={Brand.orange} height={STAR} width={STAR} />

					<Text numberOfLines={1} style={styles.meta}>
						{score}
					</Text>
				</View>
			</View>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Gap.card,
		paddingVertical: Spacing.two,
	},
	thumb: {
		width: THUMB_WIDTH,
		height: THUMB_HEIGHT,
		borderRadius: Radius.control,
		backgroundColor: Ink.border,
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
		...Type.resultMeta,
		color: Ink.meta,
	},
	ratingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	pressed: {
		opacity: 0.7,
	},
});
