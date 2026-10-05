import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PinSolidIcon from "@/assets/home/pin-solid.svg";
import ClockIcon from "@/assets/search/clock.svg";
import { EventAttendance } from "@/components/events/event-attendance";
import { PeopleFaces } from "@/components/events/people-faces";
import { ScreenHeader } from "@/components/nav/screen-header";
import { AvatarImage } from "@/components/ui/avatar-image";
import { StateMessage } from "@/components/ui/state-message";
import { Tag } from "@/components/ui/tag";
import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { externalSourceName } from "@/features/events/event-source";
import { hasEventEnded } from "@/features/events/event-time";
import { useEvent } from "@/features/events/use-events";
import { describeError } from "@/lib/api/api-error";
import type { ApiEventDetail } from "@/lib/api/event-schema";
import { formatClock, formatLongDate, formatPrice } from "@/utils/format";

const EDGE_INSET = Spacing.three;
const HERO_HEIGHT = 177;
const META_ICON = 16;
const HOST_AVATAR = 36;

function scheduleLine(event: ApiEventDetail): string {
	const start = new Date(event.startsAt);
	const end = event.endsAt ? new Date(event.endsAt) : null;
	const range = end ? `${formatClock(start)} to ${formatClock(end)}` : formatClock(start);

	return `${formatLongDate(start)} · ${range}`;
}

/** The real event detail for anyone who can see the event; host only rows are gated on `isHost`. */
export default function EventDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const event = useEvent(id ?? "");

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/(tabs)");
	}, []);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Event Details" />

				{event.isPending ? (
					<StateMessage message="Loading event…" />
				) : event.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(event.error)}
						onPressAction={() => void event.refetch()}
					/>
				) : (
					<EventBody event={event.data} />
				)}
			</View>
		</SafeAreaView>
	);
}

function EventBody({ event }: { event: ApiEventDetail }) {
	const venueLine = [event.venue.name, event.venue.address].filter(Boolean).join(", ");
	const sourceName = externalSourceName(event);

	return (
		<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
			<View style={styles.hero}>
				{event.coverUrl ? (
					<Image
						accessibilityIgnoresInvertColors
						contentFit="cover"
						source={{ uri: event.coverUrl }}
						style={StyleSheet.absoluteFill}
						transition={200}
					/>
				) : null}
			</View>

			<View style={styles.tags}>
				{hasEventEnded(event) ? (
					<Tag label="PAST" tone="brand" />
				) : (
					<Tag label="UPCOMING" tone="success" />
				)}

				<Tag label={event.isPublic ? "PUBLIC" : "PRIVATE"} tone="brand" />

				<Tag
					label={formatPrice(event.priceMinor / 100, "₦").toUpperCase()}
					tone="warning"
				/>

				{event.category ? (
					<Tag label={event.category.label.toUpperCase()} tone="brand" />
				) : null}

				{sourceName ? <Tag label={sourceName.toUpperCase()} tone="success" /> : null}
			</View>

			<Text accessibilityRole="header" style={styles.title}>
				{event.title}
			</Text>

			<View style={styles.metaCard}>
				<View style={styles.metaRow}>
					<PinSolidIcon color={Brand.purple} height={META_ICON} width={META_ICON} />

					<Text style={styles.metaLabel}>{venueLine}</Text>
				</View>

				<View style={styles.metaRow}>
					<ClockIcon color={Brand.purple} height={META_ICON} width={META_ICON} />

					<Text style={styles.metaLabel}>{scheduleLine(event)}</Text>
				</View>
			</View>

			{event.description ? (
				<View style={styles.section}>
					<Text accessibilityRole="header" style={styles.sectionTitle}>
						About this event
					</Text>

					<Text style={styles.body}>{event.description}</Text>
				</View>
			) : null}

			<Organiser event={event} sourceName={sourceName} />

			<View style={styles.section}>
				<Text accessibilityRole="header" style={styles.sectionTitle}>
					Attendees
				</Text>

				{event.attendeeCount === 0 ? (
					<Text style={styles.body}>No one has joined yet.</Text>
				) : (
					<PeopleFaces
						noun="going"
						people={event.attendees}
						total={event.attendeeCount}
					/>
				)}
			</View>

			{event.isHost ? (
				<View style={styles.section}>
					<Text accessibilityRole="header" style={styles.sectionTitle}>
						Invited
					</Text>

					{event.invitees.length === 0 ? (
						<Text style={styles.body}>You did not invite anyone to this event.</Text>
					) : (
						<PeopleFaces
							noun="invited"
							people={event.invitees}
							total={event.invitees.length}
						/>
					)}
				</View>
			) : null}

			{event.isHost ? (
				<Text style={styles.created}>
					You created this event on {formatLongDate(new Date(event.createdAt))}
				</Text>
			) : null}

			<EventAttendance event={event} />
		</ScrollView>
	);
}

/** A member host, or for an imported event the organiser named by the listing. */
function Organiser({ event, sourceName }: { event: ApiEventDetail; sourceName: string | null }) {
	const name = event.host?.fullName ?? event.organizerName ?? sourceName ?? "Organiser";
	const role = event.host
		? event.host.isVerified
			? "Verified Host"
			: "Host"
		: `Organiser · Listed on ${sourceName ?? "another site"}`;

	return (
		<View style={styles.host}>
			<AvatarImage fullName={name} size={HOST_AVATAR} uri={event.host?.avatarUrl ?? null} />

			<View style={styles.hostCopy}>
				<Text numberOfLines={1} style={styles.hostName}>
					{name}
				</Text>

				<Text style={styles.hostRole}>{role}</Text>
			</View>
		</View>
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
		flexGrow: 1,
		gap: Gap.card,
		paddingBottom: Spacing.six,
	},
	hero: {
		height: HERO_HEIGHT,
		borderRadius: Radius.control,
		overflow: "hidden",
		backgroundColor: Ink.border,
	},
	tags: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	title: {
		...Type.subtitle,
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
		...Type.docBody,
		color: Ink.muted,
	},
	host: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
	},
	hostCopy: {
		flex: 1,
		gap: Spacing.half,
	},
	hostName: {
		...Type.resultName,
		color: Ink.title,
	},
	hostRole: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	created: {
		...Type.resultMeta,
		color: Ink.meta,
		textAlign: "center",
		paddingTop: Spacing.two,
	},
});
