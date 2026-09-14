import { memo, type ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ClockIcon from "@/assets/search/clock.svg";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import { formatSlot } from "@/features/meetups/time-slots";
import type { ApiMeetup } from "@/lib/api/meetup-schema";

export type MeetupCardProps = {
	meetup: ApiMeetup;
	partyName: string;
	isPending: boolean;
	onAccept: (scheduledAt: string) => void;
	onDecline: () => void;
	onCounter: () => void;
	onCancel: () => void;
};

const ICON = 18;

/**
 * One component, four faces, chosen from the meetup's current state rather
 * than from which card this is. That is what lets an old proposal card fall
 * silent once the answer has been given: it re-reads, sees `scheduled`, and
 * renders the confirmed face instead of stale buttons.
 *
 * Faces: Proposal (it's my turn: pick a time, confirm, or suggest another),
 * Waiting (their turn: the times I offered, and a cancel), Confirmed (venue,
 * time, and the arrival-code entry that step 11 will make live), and a
 * closed line for declined, cancelled, expired or ended.
 */
function MeetupCardComponent({
	meetup,
	partyName,
	isPending,
	onAccept,
	onDecline,
	onCounter,
	onCancel,
}: MeetupCardProps) {
	const [chosen, setChosen] = useState<string | null>(
		meetup.proposedTimes.length === 1 ? meetup.proposedTimes[0] : null,
	);
	const first = partyName.split(" ")[0] || "They";

	if (meetup.status === "proposed" && meetup.isAwaitingMe) {
		return (
			<Frame title="Meetup Proposal" subtitle={`${first} suggested some times`}>
				<View style={styles.pills}>
					{meetup.proposedTimes.map((iso) => {
						const selected = iso === chosen;

						return (
							<Pressable
								accessibilityRole="radio"
								accessibilityState={{ selected }}
								key={iso}
								onPress={() => setChosen(iso)}
								style={[styles.pill, selected && styles.pillSelected]}
							>
								<Text style={[styles.pillLabel, selected && styles.pillLabelSelected]}>
									{formatSlot(iso)}
								</Text>
							</Pressable>
						);
					})}
				</View>

				<Actions
					primary={{
						label: "Confirm Meetup",
						disabled: chosen === null || isPending,
						onPress: () => chosen && onAccept(chosen),
					}}
					secondary={{ label: "Suggest other time", disabled: isPending, onPress: onCounter }}
					tertiary={{ label: "Decline", disabled: isPending, onPress: onDecline }}
				/>
			</Frame>
		);
	}

	if (meetup.status === "proposed") {
		return (
			<Frame title="Proposal sent" subtitle={`Waiting for ${first} to respond`}>
				<View style={styles.pills}>
					{meetup.proposedTimes.map((iso) => (
						<View key={iso} style={styles.pill}>
							<Text style={styles.pillLabel}>{formatSlot(iso)}</Text>
						</View>
					))}
				</View>

				<Actions tertiary={{ label: "Withdraw", disabled: isPending, onPress: onCancel }} />
			</Frame>
		);
	}

	if (meetup.status === "scheduled" || meetup.status === "active") {
		return (
			<Frame
				title={meetup.status === "active" ? "Meetup in progress" : "Meetup Confirmed"}
				subtitle={meetup.scheduledAt ? formatSlot(meetup.scheduledAt) : ""}
				tone="confirmed"
			>
				{meetup.venue ? (
					<View style={styles.venue}>
						<Text style={styles.venueName}>{meetup.venue.name}</Text>
						{meetup.venue.address ? (
							<Text style={styles.venueAddress}>{meetup.venue.address}</Text>
						) : null}
					</View>
				) : null}

				<Actions
					primary={{
						label: "Get Your Arrival Code",
						// Arrival codes are Phase 3 step 11. The control is in the
						// design and in the card, and reads as coming rather than dead.
						disabled: true,
						onPress: () => undefined,
					}}
					tertiary={
						meetup.status === "scheduled"
							? { label: "Cancel meetup", disabled: isPending, onPress: onCancel }
							: undefined
					}
				/>
			</Frame>
		);
	}

	return (
		<View style={styles.closed}>
			<ClockIcon color={Ink.muted} height={ICON} width={ICON} />
			<Text style={styles.closedText}>{closedCopy(meetup, first)}</Text>
		</View>
	);
}

function closedCopy(meetup: ApiMeetup, first: string): string {
	switch (meetup.status) {
		case "declined":
			return meetup.isProposer ? `${first} can't make those times` : "You declined";
		case "cancelled":
			return "Meetup cancelled";
		case "expired":
			return "Proposal expired";
		case "ended":
			return "Meetup ended";
		default:
			return "";
	}
}

function Frame({
	title,
	subtitle,
	tone = "proposal",
	children,
}: {
	title: string;
	subtitle: string;
	tone?: "proposal" | "confirmed";
	children: ReactNode;
}) {
	return (
		<View style={[styles.card, tone === "confirmed" && styles.cardConfirmed]}>
			<View style={styles.head}>
				<ClockIcon
					color={tone === "confirmed" ? Ink.success : Brand.purple}
					height={ICON}
					width={ICON}
				/>
				<View style={styles.headText}>
					<Text style={styles.title}>{title}</Text>
					{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
				</View>
			</View>

			{children}
		</View>
	);
}

type Action = { label: string; disabled: boolean; onPress: () => void };

function Actions({
	primary,
	secondary,
	tertiary,
}: {
	primary?: Action;
	secondary?: Action;
	tertiary?: Action;
}) {
	return (
		<View style={styles.actions}>
			{primary ? (
				<Pressable
					accessibilityRole="button"
					accessibilityState={{ disabled: primary.disabled }}
					disabled={primary.disabled}
					onPress={primary.onPress}
					style={({ pressed }) => [
						styles.primary,
						primary.disabled && styles.primaryDisabled,
						pressed && styles.pressed,
					]}
				>
					<Text style={styles.primaryLabel}>{primary.label}</Text>
				</Pressable>
			) : null}

			{secondary ? (
				<Pressable
					accessibilityRole="button"
					accessibilityState={{ disabled: secondary.disabled }}
					disabled={secondary.disabled}
					onPress={secondary.onPress}
					style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
				>
					<Text style={styles.secondaryLabel}>{secondary.label}</Text>
				</Pressable>
			) : null}

			{tertiary ? (
				<Pressable
					accessibilityRole="button"
					accessibilityState={{ disabled: tertiary.disabled }}
					disabled={tertiary.disabled}
					onPress={tertiary.onPress}
					style={({ pressed }) => [styles.tertiary, pressed && styles.pressed]}
				>
					<Text style={styles.tertiaryLabel}>{tertiary.label}</Text>
				</Pressable>
			) : null}
		</View>
	);
}

export const MeetupCard = memo(MeetupCardComponent);

const styles = StyleSheet.create({
	card: {
		alignSelf: "center",
		width: "92%",
		backgroundColor: Brand.purpleSurfaceSubtle,
		borderWidth: 1,
		borderColor: Brand.purpleTint,
		borderRadius: Radius.media,
		padding: Spacing.three,
		gap: Spacing.three,
		marginVertical: Spacing.two,
	},
	cardConfirmed: {
		backgroundColor: Ink.successSurface,
		borderColor: Ink.successBorder,
	},
	head: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
	headText: {
		flex: 1,
		gap: Spacing.half,
	},
	title: {
		...Type.featureTitle,
		color: Ink.title,
	},
	subtitle: {
		...Type.cardMeta,
		color: Ink.muted,
	},
	pills: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	pill: {
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
		borderRadius: Radius.pill,
		borderWidth: 1,
		borderColor: Ink.border,
		backgroundColor: Ink.surface,
	},
	pillSelected: {
		borderColor: Brand.purple,
		backgroundColor: Brand.purpleSurface,
	},
	pillLabel: {
		...Type.cardAction,
		color: Ink.body,
	},
	pillLabelSelected: {
		color: Brand.purple,
	},
	venue: {
		gap: Spacing.half,
	},
	venueName: {
		...Type.cardName,
		color: Ink.title,
	},
	venueAddress: {
		...Type.cardMeta,
		color: Ink.muted,
	},
	actions: {
		gap: Spacing.two,
	},
	primary: {
		backgroundColor: Brand.purple,
		borderRadius: Radius.control,
		paddingVertical: Gap.card,
		alignItems: "center",
	},
	primaryDisabled: {
		opacity: 0.45,
	},
	primaryLabel: {
		...Type.action,
		color: Brand.onBrand,
	},
	secondary: {
		borderWidth: 1,
		borderColor: Brand.purple,
		borderRadius: Radius.control,
		paddingVertical: Gap.card,
		alignItems: "center",
	},
	secondaryLabel: {
		...Type.action,
		color: Brand.purple,
	},
	tertiary: {
		alignItems: "center",
		paddingVertical: Spacing.two,
	},
	tertiaryLabel: {
		...Type.cardAction,
		color: Ink.muted,
	},
	pressed: {
		opacity: 0.7,
	},
	closed: {
		alignSelf: "center",
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
		paddingVertical: Spacing.two,
	},
	closedText: {
		...Type.cardMeta,
		color: Ink.muted,
	},
});
