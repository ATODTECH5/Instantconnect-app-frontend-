import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PinSolidIcon from "@/assets/home/pin-solid.svg";
import ClockIcon from "@/assets/search/clock.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { AvatarImage } from "@/components/ui/avatar-image";
import { StateMessage } from "@/components/ui/state-message";
import { Tag } from "@/components/ui/tag";
import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { useEvent } from "@/features/events/use-events";
import { describeError } from "@/lib/api/api-error";
import type { ApiEventDetail } from "@/lib/api/event-schema";
import { formatClock, formatLongDate, formatPrice } from "@/utils/format";

const EDGE_INSET = Spacing.three;
const HERO_HEIGHT = 177;
const META_ICON = 16;
const HOST_AVATAR = 36;
const FACE = 40;
/** Faces the row shows before the rest collapse into "+N". */
const MAX_FACES = 6;

function scheduleLine(event: ApiEventDetail): string {
	const start = new Date(event.startsAt);
	const end = event.endsAt ? new Date(event.endsAt) : null;
	const range = end ? `${formatClock(start)} to ${formatClock(end)}` : formatClock(start);

	return `${formatLongDate(start)} · ${range}`;
}

function hasEnded(event: ApiEventDetail): boolean {
	return new Date(event.endsAt ?? event.startsAt).getTime() < Date.now();
}

export default function HostedEventScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const event = useEvent(id ?? "");

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/profile/create-event");
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
	const faces = event.invitees.slice(0, MAX_FACES);
	const extra = event.invitees.length - faces.length;

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
				{hasEnded(event) ? (
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

			<View style={styles.host}>
				<AvatarImage
					fullName={event.host.fullName}
					size={HOST_AVATAR}
					uri={event.host.avatarUrl}
				/>

				<View style={styles.hostCopy}>
					<Text numberOfLines={1} style={styles.hostName}>
						{event.host.fullName}
					</Text>

					<Text style={styles.hostRole}>
						{event.host.isVerified ? "Verified Host" : "Host"}
					</Text>
				</View>
			</View>

			{event.isHost ? (
				<View style={styles.section}>
					<Text accessibilityRole="header" style={styles.sectionTitle}>
						Invited
					</Text>

					{faces.length === 0 ? (
						<Text style={styles.body}>You did not invite anyone to this event.</Text>
					) : (
						<View style={styles.faces}>
							{faces.map((person) => (
								<View key={person.id} style={styles.face}>
									<AvatarImage
										fullName={person.fullName}
										size={FACE}
										uri={person.avatarUrl}
									/>

									<Text numberOfLines={1} style={styles.faceName}>
										{person.fullName.split(" ")[0]}
									</Text>
								</View>
							))}

							{extra > 0 ? (
								<View
									accessibilityLabel={`${extra} more invited`}
									style={styles.extra}
								>
									<Text style={styles.extraLabel}>+{extra}</Text>
								</View>
							) : null}
						</View>
					)}
				</View>
			) : null}

			{event.isHost ? (
				<Text style={styles.created}>
					You created this event on {formatLongDate(new Date(event.createdAt))}
				</Text>
			) : null}
		</ScrollView>
	);
}

const EXTRA = 25;

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
	faces: {
		flexDirection: "row",
		alignItems: "flex-start",
		flexWrap: "wrap",
		gap: Gap.snug,
	},
	face: {
		alignItems: "center",
		gap: Spacing.half,
		width: FACE + Spacing.two,
	},
	faceName: {
		...Type.categoryLabel,
		color: Ink.muted,
	},
	extra: {
		width: EXTRA,
		height: EXTRA,
		borderRadius: EXTRA / 2,
		alignItems: "center",
		justifyContent: "center",
		marginTop: (FACE - EXTRA) / 2,
		backgroundColor: Brand.purple,
	},
	extraLabel: {
		...Type.badgeLabel,
		color: Brand.onBrand,
	},
	created: {
		...Type.resultMeta,
		color: Ink.meta,
		textAlign: "center",
		paddingTop: Spacing.two,
	},
});
