import { Image } from "expo-image";
import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import StarIcon from "@/assets/search/star.svg";
import { Brand, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { VisitedPlace } from "@/features/connections/visited-places";

const MEDIA_HEIGHT = 108;
const STAR = 12;
const DOT = 5;

export type VisitedPlaceCardProps = {
	place: VisitedPlace;
	/**
	 * Omitted while there is nowhere for a place to open. The card then renders
	 * as plain content rather than a button that announces "Opens this place"
	 * and does nothing, or worse, lands somewhere unrelated.
	 */
	onOpen?: (id: string) => void;
};

export const VisitedPlaceCard = memo(function VisitedPlaceCard({
	place,
	onOpen,
}: VisitedPlaceCardProps) {
	const visits = `${place.visitCount} ${place.visitCount === 1 ? "Visit" : "Visits"}`;

	const label = `${place.name}. ${place.address}. ${visits}. Last visited ${place.lastVisitedLabel}${
		place.isHighlySecure ? ". Highly secure" : ""
	}`;

	const body = (
		<>
			<View style={styles.media}>
				<Image
					accessibilityIgnoresInvertColors
					contentFit="cover"
					source={place.photo}
					style={StyleSheet.absoluteFill}
					transition={200}
				/>

				<View style={styles.rating}>
					<StarIcon color={Brand.onBrand} height={STAR} width={STAR} />

					<Text style={styles.ratingLabel}>{place.rating.toFixed(1)}</Text>
				</View>
			</View>

			<View style={styles.body}>
				<View style={styles.titleRow}>
					<Text numberOfLines={1} style={styles.name}>
						{place.name}
					</Text>

					<View style={styles.badge}>
						<Text style={styles.badgeLabel}>{visits}</Text>
					</View>
				</View>

				<Text numberOfLines={1} style={styles.address}>
					{place.address}
				</Text>

				<View style={styles.divider} />

				<View style={styles.footer}>
					<Text numberOfLines={1} style={styles.footerLabel}>
						Last visited: {place.lastVisitedLabel}
					</Text>

					{place.isHighlySecure ? (
						<View style={styles.secure}>
							<View style={styles.secureDot} />

							<Text style={styles.secureLabel}>Highly Secure</Text>
						</View>
					) : null}
				</View>
			</View>
		</>
	);

	if (!onOpen) {
		return (
			<View accessible accessibilityLabel={label} style={styles.card}>
				{body}
			</View>
		);
	}

	return (
		<Pressable
			accessibilityHint="Opens this place"
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={() => onOpen(place.id)}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
		>
			{body}
		</Pressable>
	);
});

const styles = StyleSheet.create({
	card: {
		padding: Spacing.half,
		borderRadius: Radius.control,
		backgroundColor: Ink.surface,
		...Platform.select({
			ios: {
				shadowColor: "#000000",
				shadowOpacity: 0.1,
				shadowRadius: 10,
				shadowOffset: { width: 0, height: 0 },
			},
			android: { elevation: 3 },
			default: {},
		}),
	},
	media: {
		height: MEDIA_HEIGHT,
		borderRadius: Radius.checkbox,
		overflow: "hidden",
		backgroundColor: Ink.border,
	},
	rating: {
		position: "absolute",
		left: Spacing.two,
		bottom: Spacing.one,
		flexDirection: "row",
		alignItems: "center",
		gap: 1,
		paddingHorizontal: Spacing.half,
		paddingVertical: 1,
		borderRadius: 2,
		backgroundColor: Ink.mediaGlass,
	},
	ratingLabel: {
		...Type.badgeLabel,
		color: Brand.onBrand,
	},
	body: {
		gap: Spacing.half,
		padding: Spacing.two,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	name: {
		...Type.resultCount,
		flexShrink: 1,
		color: Ink.title,
	},
	badge: {
		paddingHorizontal: Spacing.one,
		paddingVertical: Spacing.half,
		borderRadius: Radius.checkbox,
		backgroundColor: Brand.purpleTint,
	},
	badgeLabel: {
		...Type.badgeLabel,
		color: Brand.purple,
	},
	address: {
		...Type.sliderTick,
		color: Ink.meta,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		marginVertical: Spacing.half,
		backgroundColor: Ink.rowBorder,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	footerLabel: {
		...Type.sliderTick,
		flexShrink: 1,
		color: Ink.meta,
	},
	secure: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.half,
	},
	secureDot: {
		width: DOT,
		height: DOT,
		borderRadius: DOT / 2,
		backgroundColor: Ink.secure,
	},
	secureLabel: {
		...Type.sliderTick,
		color: Ink.secure,
	},
	pressed: {
		opacity: 0.85,
	},
});
