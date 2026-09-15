import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CodeBoxes } from "@/components/auth/code-boxes";
import { OtpInput } from "@/components/auth/otp-input";
import { MeetupMap } from "@/components/map/meetup-map";
import { ScreenHeader } from "@/components/nav/screen-header";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { useConversationSummary } from "@/features/chat/use-thread";
import { formatSlot } from "@/features/meetups/time-slots";
import { formatCountdown, useCountdown } from "@/features/meetups/use-countdown";
import { useLiveLocation } from "@/features/meetups/use-live-location";
import {
	useIssueArrivalCode,
	useMeetup,
	useMeetupAction,
	useReportLocation,
	useSetArrival,
	useSetLocationSharing,
	useVerifyArrivalCode,
} from "@/features/meetups/use-meetup";
import { describeError } from "@/lib/api/api-error";
import type { ApiMeetup } from "@/lib/api/meetup-schema";

const CODE_LENGTH = 4;
const EDGE_INSET = Spacing.three;

export default function MeetupScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const meetup = useMeetup(id);
	const goBack = useCallback(() => router.back(), []);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Meetup" />

				{meetup.isPending ? (
					<StateMessage message="Loading your meetup…" />
				) : meetup.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(meetup.error)}
						onPressAction={() => void meetup.refetch()}
					/>
				) : (
					<Loaded meetup={meetup.data} />
				)}
			</View>
		</SafeAreaView>
	);
}

function Loaded({ meetup }: { meetup: ApiMeetup }) {
	const conversation = useConversationSummary(meetup.conversationId);
	const partyName = conversation?.party.fullName.split(" ")[0] ?? "them";
	const issue = useIssueArrivalCode(meetup);
	const verify = useVerifyArrivalCode(meetup);
	const travel = useSetArrival(meetup);
	const action = useMeetupAction(meetup.conversationId);
	const sharing = useSetLocationSharing(meetup);
	const report = useReportLocation(meetup);
	const live = useLiveLocation(meetup.me.isSharingLocation, (fix) => report.mutate(fix));
	const [entered, setEntered] = useState("");
	const untilMeet = useCountdown(meetup.scheduledAt);
	const untilExpiry = useCountdown(meetup.me.codeExpiresAt);

	// The plain code exists only in the issue response. Once the server
	// reports no live code (consumed, expired, or reissued elsewhere) the
	// digits on screen would be a lie, so they go with it.
	const shownCode = meetup.me.codeExpiresAt ? issue.data?.code : undefined;

	const submitCode = useCallback(
		(code: string) =>
			verify.mutate(code, {
				onSuccess: (result) => {
					if (result.verified) setEntered("");
				},
			}),
		[verify],
	);

	const error =
		issue.error ??
		verify.error ??
		travel.error ??
		action.error ??
		sharing.error ??
		report.error ??
		null;
	const busy =
		issue.isPending ||
		verify.isPending ||
		travel.isPending ||
		action.isPending ||
		sharing.isPending;
	const isLive = meetup.status === "scheduled" || meetup.status === "active";

	if (!isLive) {
		return (
			<StateMessage
				message={
					meetup.status === "ended"
						? "This meetup has ended. Hope it went well!"
						: `This meetup was ${meetup.status}.`
				}
			/>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
			{error ? <FormErrorBanner message={describeError(error)} /> : null}

			<View style={[styles.card, meetup.status === "active" && styles.cardActive]}>
				<Text style={styles.eyebrow}>
					{meetup.status === "active" ? "Meetup in progress" : "Scheduled"}
				</Text>
				{meetup.venue ? <Text style={styles.venue}>{meetup.venue.name}</Text> : null}
				{meetup.venue?.address ? (
					<Text style={styles.venueMeta}>{meetup.venue.address}</Text>
				) : null}
				{meetup.scheduledAt ? (
					<Text style={styles.venueMeta}>
						{formatSlot(meetup.scheduledAt)}
						{meetup.status === "scheduled" && untilMeet > 0
							? ` · in ${formatCountdown(untilMeet)}`
							: ""}
					</Text>
				) : null}
			</View>

			<View style={styles.card}>
				<View style={styles.rowBetween}>
					<View style={styles.rowText}>
						<Text style={styles.title}>Live location</Text>
						<Text style={styles.copy}>
							{meetup.me.isSharingLocation
								? live.isWatching
									? `Sharing with ${partyName} while this screen is open.`
									: live.permission === "blocked"
										? "Location is off for this app. Turn it on in Settings to share."
										: "Waiting for a GPS fix…"
								: `Let ${partyName} see where you are until the meetup ends.`}
						</Text>
					</View>
					<Switch
						accessibilityHint={`Shares your position with ${partyName}`}
						accessibilityLabel="Share live location"
						accessibilityRole="switch"
						disabled={busy}
						onValueChange={(next) => sharing.mutate(next)}
						trackColor={{ true: Brand.purple, false: Ink.border }}
						value={meetup.me.isSharingLocation}
					/>
				</View>

				<View style={styles.tags}>
					{live.isWatching ? <Tag label="GPS Active" tone="brand" /> : null}
					{meetup.me.isInSafeZone ? <Tag label="Safe Zone Active" tone="success" /> : null}
				</View>

				<MeetupMap
					me={meetup.me.location}
					party={meetup.party.location}
					partyName={partyName}
					venue={
						meetup.venue && meetup.venue.latitude !== null && meetup.venue.longitude !== null
							? { latitude: meetup.venue.latitude, longitude: meetup.venue.longitude }
							: null
					}
				/>

				<Text style={styles.partyStatus}>{describeParty(meetup, partyName)}</Text>
			</View>

			<SecondaryButton
				accessibilityHint="Choose which safety circles hear about this meetup"
				disabled={busy}
				label="Safety dispatch"
				onPress={() => router.push(`/meetup/dispatch/${meetup.id}`)}
			/>

			{meetup.status === "active" ? (
				<View style={[styles.card, styles.cardActive]}>
					<Text style={styles.title}>You&apos;re both verified</Text>
					<Text style={styles.copy}>
						Each of you confirmed the other arrived. Enjoy it, and end the meetup here when
						you part ways.
					</Text>
					<PrimaryButton
						accessibilityHint="Marks this meetup as finished"
						disabled={busy}
						label="End meetup"
						loading={action.isPending}
						onPress={() => action.mutate({ type: "end", id: meetup.id })}
						tone="solid"
					/>
				</View>
			) : (
				<>
					<View style={styles.card}>
						<Text style={styles.title}>Your one time code</Text>

						{meetup.me.isVerified ? (
							<Text style={styles.done}>✓ {partyName} confirmed you arrived</Text>
						) : shownCode ? (
							<>
								<Text style={styles.copy}>Show this to {partyName} when you meet.</Text>
								<CodeBoxes active={false} length={CODE_LENGTH} value={shownCode} />
								<Text style={styles.expiry}>
									{untilExpiry > 0
										? `Expires in ${formatCountdown(untilExpiry)}`
										: "Expired. Get a new one."}
								</Text>
								<SecondaryButton
									accessibilityHint="Replaces this code with a new one"
									disabled={busy}
									label="New code"
									onPress={() => issue.mutate()}
								/>
							</>
						) : (
							<>
								<Text style={styles.copy}>
									{meetup.me.codeExpiresAt
										? "You have a code on another device. Get a new one to see it here."
										: `Get a code and show it to ${partyName} when you arrive. They enter it to confirm you're there.`}
								</Text>
								<PrimaryButton
									accessibilityHint="Generates your arrival code"
									disabled={busy}
									label={meetup.me.codeExpiresAt ? "New code" : "Get your code"}
									loading={issue.isPending}
									onPress={() => issue.mutate()}
								/>
							</>
						)}
					</View>

					<View style={styles.card}>
						<Text style={styles.title}>Confirm {partyName} arrived</Text>

						{meetup.party.isVerified ? (
							<Text style={styles.done}>✓ You confirmed {partyName} arrived</Text>
						) : (
							<>
								<Text style={styles.copy}>Enter the code on {partyName}&apos;s phone.</Text>
								<OtpInput
									editable={!busy}
									error={
										verify.data && !verify.data.verified
											? `Wrong code. ${verify.data.attemptsLeft} ${verify.data.attemptsLeft === 1 ? "try" : "tries"} left.`
											: undefined
									}
									length={CODE_LENGTH}
									onChange={setEntered}
									onComplete={(code) => submitCode(code)}
									value={entered}
								/>
								<PrimaryButton
									accessibilityHint="Checks the code you entered"
									disabled={entered.length !== CODE_LENGTH || busy}
									label="Verify"
									loading={verify.isPending}
									onPress={() => submitCode(entered)}
								/>
							</>
						)}
					</View>

					{meetup.me.arrivalState !== "arrived" ? (
						<View style={styles.travel}>
							{meetup.me.arrivalState === "pending" ? (
								<SecondaryButton
									accessibilityHint={`Tells ${partyName} you have set off`}
									disabled={busy}
									label="I'm on my way"
									onPress={() => travel.mutate("en_route")}
								/>
							) : null}
							<SecondaryButton
								accessibilityHint={`Tells ${partyName} you are at the venue`}
								disabled={busy}
								label="I've arrived"
								onPress={() => travel.mutate("arrived")}
							/>
						</View>
					) : null}

					<SecondaryButton
						accessibilityHint="Calls off this meetup for both of you"
						disabled={busy}
						label="Cancel meetup"
						onPress={() => action.mutate({ type: "cancel", id: meetup.id })}
						tone="danger"
					/>
				</>
			)}
		</ScrollView>
	);
}

/**
 * One sentence about the other person, from the best information there is:
 * a shared fix beats a self-reported travel state, and either beats nothing.
 */
function describeParty(meetup: ApiMeetup, name: string): string {
	const { party } = meetup;

	if (party.location && party.distanceToVenueM !== null) {
		const ago = party.locationAt ? agoLabel(party.locationAt) : "";
		const where = party.isInSafeZone
			? "is at the venue"
			: `is ${formatDistance(party.distanceToVenueM)} from the venue`;

		return `${name} ${where}${ago ? ` · ${ago}` : ""}`;
	}

	if (party.location) return `${name} is sharing their location`;
	if (party.arrivalState === "arrived") return `${name} says they have arrived`;
	if (party.arrivalState === "en_route") return `${name} is on the way`;

	return `${name} isn't sharing their location yet`;
}

function formatDistance(metres: number): string {
	return metres < 1000 ? `${metres}m` : `${(metres / 1000).toFixed(1)}km`;
}

function agoLabel(iso: string): string {
	const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));

	if (seconds < 60) return "just now";
	if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;

	return `${Math.floor(seconds / 3600)}h ago`;
}

function Tag({ label, tone }: { label: string; tone: "brand" | "success" }) {
	return (
		<View style={[styles.tag, tone === "success" ? styles.tagSuccess : styles.tagBrand]}>
			<Text style={[styles.tagLabel, tone === "success" ? styles.tagLabelSuccess : null]}>
				{label}
			</Text>
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
	body: {
		flexGrow: 1,
		gap: Gap.card,
		paddingBottom: Spacing.five,
	},
	card: {
		backgroundColor: Brand.purpleSurfaceSubtle,
		borderWidth: 1,
		borderColor: Brand.purpleTint,
		borderRadius: Radius.media,
		padding: Spacing.three,
		gap: Gap.card,
	},
	cardActive: {
		backgroundColor: Ink.successSurface,
		borderColor: Ink.successBorder,
	},
	eyebrow: {
		...Type.cardMeta,
		color: Ink.muted,
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	venue: {
		...Type.featureTitle,
		color: Ink.title,
	},
	venueMeta: {
		...Type.cardMeta,
		color: Ink.muted,
	},
	title: {
		...Type.featureTitle,
		color: Ink.title,
	},
	copy: {
		...Type.slideBody,
		color: Ink.body,
	},
	done: {
		...Type.action,
		color: Ink.success,
	},
	expiry: {
		...Type.cardMeta,
		color: Ink.muted,
		textAlign: "center",
	},
	travel: {
		gap: Spacing.two,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
	},
	rowText: {
		flex: 1,
		gap: Spacing.one,
	},
	tags: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	tag: {
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.one,
		borderRadius: Radius.pill,
	},
	tagBrand: {
		backgroundColor: Brand.purpleSurface,
	},
	tagSuccess: {
		backgroundColor: Ink.successSurface,
		borderWidth: 1,
		borderColor: Ink.successBorder,
	},
	tagLabel: {
		...Type.badgeLabel,
		color: Brand.purple,
	},
	tagLabelSuccess: {
		color: Ink.success,
	},
	partyStatus: {
		...Type.cardMeta,
		color: Ink.muted,
		textAlign: "center",
	},
});
