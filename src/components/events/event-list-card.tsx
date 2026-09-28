import { Image } from "expo-image";
import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import ArrowRightIcon from "@/assets/connections/arrow-right.svg";
import PinSolidIcon from "@/assets/home/pin-solid.svg";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

const MEDIA_HEIGHT = 108;
const PIN = 10;
const ARROW = 12;

export type EventListCardProps = {
	id: string;
	title: string;
	venue: string;
	/** "400km away". Omitted where distance means nothing, such as your own event. */
	distanceLabel?: string;
	scheduleLabel: string;
	photo: ImageSourcePropType | null;
	faces: ImageSourcePropType[];
	extraFaces: number;
	/** "45 attending", "4 invited". */
	countLabel: string;
	actionLabel: string;
	onOpen: (id: string) => void;
};

/** Cover, title, venue and faces, closed by a count and an action link. */
export const EventListCard = memo(function EventListCard({
	id,
	title,
	venue,
	distanceLabel,
	scheduleLabel,
	photo,
	faces,
	extraFaces,
	countLabel,
	actionLabel,
	onOpen,
}: EventListCardProps) {
	return (
		<Pressable
			accessibilityHint="Opens this event"
			accessibilityLabel={`${title} at ${venue}. ${scheduleLabel}. ${countLabel}`}
			accessibilityRole="button"
			onPress={() => onOpen(id)}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
		>
			<View style={styles.media}>
				{photo ? (
					<Image
						accessibilityIgnoresInvertColors
						contentFit="cover"
						source={photo}
						style={StyleSheet.absoluteFill}
						transition={200}
					/>
				) : null}
			</View>

			<View style={styles.body}>
				<View style={styles.detailRow}>
					<View style={styles.copy}>
						<Text numberOfLines={2} style={styles.title}>
							{title}
						</Text>

						<View style={styles.venueRow}>
							<PinSolidIcon color={Brand.purple} height={PIN} width={PIN} />

							<Text numberOfLines={1} style={styles.venue}>
								{venue}
							</Text>
						</View>

						{distanceLabel ? (
							<Text style={styles.distance}>{distanceLabel}</Text>
						) : null}

						<Text style={styles.schedule}>{scheduleLabel}</Text>
					</View>

					{faces.length > 0 || extraFaces > 0 ? (
						<AvatarStack
							accessibilityLabel={countLabel}
							avatars={faces}
							extraCount={extraFaces}
						/>
					) : null}
				</View>

				<View style={styles.footer}>
					<Text style={styles.count}>{countLabel}</Text>

					<View style={styles.action}>
						<Text style={styles.actionLabel}>{actionLabel}</Text>

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
	count: {
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
