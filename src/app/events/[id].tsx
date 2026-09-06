import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClockIcon from "@/assets/search/clock.svg";
import PinSolidIcon from "@/assets/home/pin-solid.svg";
import {
	AttendanceSheet,
	type AttendanceSheetState,
} from "@/components/events/attendance-sheet";
import { ScreenHeader } from "@/components/nav/screen-header";
import { AvatarImage } from "@/components/ui/avatar-image";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { findRegisteredEvent } from "@/features/connections/registered-events";
import { formatDistance, formatSchedule } from "@/utils/format";

const EDGE_INSET = Spacing.three;
const HERO_HEIGHT = 177;
const META_ICON = 16;
const ATTENDEE = 40;
/** Faces the row shows before the rest collapse into "+N". */
const MAX_FACES = 6;

export default function EventDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const event = useMemo(() => findRegisteredEvent(id ?? ""), [id]);

	const [sheet, setSheet] = useState<AttendanceSheetState>("none");
	const [reasonId, setReasonId] = useState<string | null>(null);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/connections/events");
	}, []);

	const backToEvents = useCallback(() => {
		setSheet("none");
		router.replace("/connections/events");
	}, []);

	if (!event) {
		return (
			<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
				<StatusBar style="dark" />

				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="Event Details" />

					<StateMessage
						actionLabel="Back to events"
						message="That event is no longer available."
						onPressAction={backToEvents}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const faces = event.attendees.slice(0, MAX_FACES);
	const extra = Math.max(event.attendeeCount - faces.length, 0);
	const price = event.priceMinor === 0 ? "Free" : `₦${(event.priceMinor / 100).toLocaleString()}`;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Event Details" />

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.hero}>
						<Image
							accessibilityIgnoresInvertColors
							contentFit="cover"
							source={event.photo}
							style={StyleSheet.absoluteFill}
							transition={200}
						/>

						<View style={styles.distancePill}>
							<Text style={styles.distanceLabel}>
								{formatDistance(event.distanceKm)}
							</Text>
						</View>
					</View>

					<View style={styles.titleRow}>
						<Text style={styles.title}>{event.title}</Text>

						<Text style={styles.price}>{price}</Text>
					</View>

					<View style={styles.metaCard}>
						<View style={styles.metaRow}>
							<PinSolidIcon
								color={Brand.purple}
								height={META_ICON}
								width={META_ICON}
							/>

							<Text style={styles.metaLabel}>{event.address}</Text>
						</View>

						<View style={styles.metaRow}>
							<ClockIcon
								color={Brand.purple}
								height={META_ICON}
								width={META_ICON}
							/>

							<Text style={styles.metaLabel}>{formatSchedule(event.startsAt)}</Text>
						</View>
					</View>

					<View style={styles.section}>
						<Text accessibilityRole="header" style={styles.sectionTitle}>
							About this event
						</Text>

						<Text style={styles.body}>{event.about}</Text>
					</View>

					<View style={styles.organiser}>
						<AvatarImage
							fullName={event.organiserName}
							size={36}
							uri={null}
						/>

						<View style={styles.organiserCopy}>
							<Text numberOfLines={1} style={styles.organiserName}>
								{event.organiserName}
							</Text>

							<Text style={styles.organiserRole}>
								{event.isVerifiedHost ? "Verified Host Organization" : "Host"}
							</Text>
						</View>
					</View>

					<View style={styles.section}>
						<Text accessibilityRole="header" style={styles.sectionTitle}>
							Attendees
						</Text>

						<View style={styles.attendees}>
							{faces.map((attendee) => (
								<View key={attendee.id} style={styles.attendee}>
									<Image
										accessibilityIgnoresInvertColors
										contentFit="cover"
										source={attendee.avatar}
										style={styles.attendeePhoto}
									/>

									<Text numberOfLines={1} style={styles.attendeeName}>
										{attendee.name}
									</Text>
								</View>
							))}

							{extra > 0 ? (
								<View
									accessibilityLabel={`${extra} more attending`}
									style={styles.extra}
								>
									<Text style={styles.extraLabel}>+{extra}</Text>
								</View>
							) : null}
						</View>
					</View>

					<View style={styles.footer}>
						<Text style={styles.joined}>
							You joined this event on {event.joinedAtLabel}
						</Text>

						<SecondaryButton
							accessibilityHint="Asks you to confirm before cancelling"
							label="Cancel Attendance"
							onPress={() => setSheet("confirm")}
							tone="danger"
						/>
					</View>
				</ScrollView>
			</View>

			<AttendanceSheet
				eventDateLabel={formatSchedule(event.startsAt)}
				eventTitle={event.title}
				onBackToEvents={backToEvents}
				onConfirmCancel={() => setSheet("cancelled")}
				onDismiss={() => setSheet("none")}
				onKeepAttending={() => setSheet("attending")}
				onReopenCancel={() => setSheet("confirm")}
				onSelectReason={setReasonId}
				onUndoCancellation={() => setSheet("attending")}
				reasonId={reasonId}
				state={sheet}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	column: {
		flex: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	content: {
		gap: Gap.card,
		paddingBottom: Spacing.six,
	},
	hero: {
		height: HERO_HEIGHT,
		borderRadius: Radius.control,
		overflow: "hidden",
		backgroundColor: Ink.border,
	},
	distancePill: {
		position: "absolute",
		left: Spacing.two,
		bottom: Spacing.two,
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.half,
		borderRadius: Radius.checkbox,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Ink.mediaGlassBorder,
		backgroundColor: Ink.mediaGlass,
	},
	distanceLabel: {
		...Type.sliderTick,
		color: Brand.onBrand,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	title: {
		...Type.subtitle,
		flexShrink: 1,
		color: Ink.title,
	},
	price: {
		...Type.fieldValue,
		color: Ink.title,
	},
	metaCard: {
		gap: Gap.snug,
		padding: Gap.snug,
		borderRadius: Radius.control,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	metaLabel: {
		...Type.fieldValue,
		flexShrink: 1,
		color: Ink.body,
	},
	section: {
		gap: Spacing.one,
	},
	sectionTitle: {
		...Type.sectionTitle,
		color: Ink.title,
	},
	body: {
		...Type.detailBio,
		color: Ink.muted,
	},
	organiser: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
	},
	organiserCopy: {
		flex: 1,
		gap: Spacing.half,
	},
	organiserName: {
		...Type.resultName,
		color: Ink.title,
	},
	organiserRole: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	attendees: {
		flexDirection: "row",
		alignItems: "flex-start",
		flexWrap: "wrap",
		gap: Gap.snug,
	},
	attendee: {
		alignItems: "center",
		gap: Spacing.half,
		width: ATTENDEE + Spacing.two,
	},
	attendeePhoto: {
		width: ATTENDEE,
		height: ATTENDEE,
		borderRadius: ATTENDEE / 2,
		backgroundColor: Ink.border,
	},
	attendeeName: {
		...Type.categoryLabel,
		color: Ink.muted,
	},
	extra: {
		width: 25,
		height: 25,
		borderRadius: 12.5,
		alignItems: "center",
		justifyContent: "center",
		marginTop: (ATTENDEE - 25) / 2,
		backgroundColor: Brand.purple,
	},
	extraLabel: {
		...Type.badgeLabel,
		color: Brand.onBrand,
	},
	footer: {
		gap: Gap.snug,
		paddingTop: Spacing.two,
	},
	joined: {
		...Type.resultMeta,
		color: Ink.meta,
		textAlign: "center",
	},
});
