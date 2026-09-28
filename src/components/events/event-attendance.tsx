import { router } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import AlertIcon from "@/assets/auth/alert-circle.svg";
import CheckIcon from "@/assets/auth/check.svg";
import { AttendanceSheet, type AttendanceSheetState } from "@/components/events/attendance-sheet";
import { Dialog } from "@/components/ui/dialog";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import { hasEventEnded } from "@/features/events/event-time";
import { useJoinEvent, useLeaveEvent } from "@/features/events/use-events";
import { describeError } from "@/lib/api/api-error";
import type { ApiEventDetail } from "@/lib/api/event-schema";
import { formatLongDate, formatPrice } from "@/utils/format";

const ICON = 28;
const MY_EVENTS = "/connections/events";

type JoinDialog = "none" | "confirm" | "joined";

export type EventAttendanceProps = {
	event: ApiEventDetail;
};

/**
 * Everything a guest can do with an event: join a free one, see that they
 * are going, and cancel. Paid events show their price and wait for checkout.
 */
export function EventAttendance({ event }: EventAttendanceProps) {
	const join = useJoinEvent();
	const leave = useLeaveEvent();

	const [dialog, setDialog] = useState<JoinDialog>("none");
	const [sheet, setSheet] = useState<AttendanceSheetState>("none");
	const [reasonId, setReasonId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const dateLabel = formatLongDate(new Date(event.startsAt));
	const isPaid = event.priceMinor > 0;
	const hasEnded = hasEventEnded(event);

	const runJoin = useCallback(
		(onJoined: () => void) => {
			setError(null);
			join.mutate(event.id, {
				onSuccess: onJoined,
				onError: (cause) => {
					setDialog("none");
					setSheet("none");
					setError(describeError(cause));
				},
			});
		},
		[event.id, join],
	);

	const confirmCancel = useCallback(() => {
		setError(null);
		leave.mutate(event.id, {
			onSuccess: () => setSheet("cancelled"),
			onError: (cause) => {
				setSheet("none");
				setError(describeError(cause));
			},
		});
	}, [event.id, leave]);

	const openMyEvents = useCallback(() => {
		setDialog("none");
		setSheet("none");
		router.push(MY_EVENTS);
	}, []);

	if (event.isHost) return null;

	if (hasEnded) {
		return <Text style={styles.note}>This event has ended.</Text>;
	}

	return (
		<View style={styles.footer}>
			{error ? <FormErrorBanner message={error} /> : null}

			{event.isAttending ? (
				<>
					{event.joinedAt ? (
						<Text style={styles.note}>
							You joined this event on {formatLongDate(new Date(event.joinedAt))}
						</Text>
					) : null}

					<SecondaryButton
						accessibilityHint="Asks you to confirm before cancelling"
						label="Cancel Attendance"
						onPress={() => setSheet("confirm")}
						tone="danger"
					/>
				</>
			) : (
				<View style={styles.bar}>
					<View style={styles.priceCopy}>
						<Text style={styles.priceLabel}>Ticket Price</Text>

						<Text style={styles.price}>
							{formatPrice(event.priceMinor / 100, "₦")}
							{isPaid ? <Text style={styles.perPerson}> /person</Text> : null}
						</Text>
					</View>

					<View style={styles.cta}>
						{isPaid ? (
							<PrimaryButton
								disabled
								label="Tickets coming soon"
								onPress={() => {}}
							/>
						) : (
							<PrimaryButton
								accessibilityHint="Asks you to confirm before joining"
								label="Join Event"
								loading={join.isPending}
								onPress={() => setDialog("confirm")}
							/>
						)}
					</View>
				</View>
			)}

			<Dialog
				actions={
					<View style={styles.dialogActions}>
						<PrimaryButton
							label="Confirm"
							loading={join.isPending}
							onPress={() => runJoin(() => setDialog("joined"))}
						/>

						<Text
							accessibilityRole="button"
							onPress={() => setDialog("none")}
							style={styles.link}
						>
							Cancel
						</Text>
					</View>
				}
				badgeColor={Brand.purpleSurface}
				icon={<AlertIcon color={Brand.purple} height={ICON} width={ICON} />}
				message="A spot will be reserved for you. Please update your status if you can't make it."
				onDismiss={() => setDialog("none")}
				title="You're about to join this event"
				visible={dialog === "confirm"}
			/>

			<Dialog
				actions={<PrimaryButton label="View My Events" onPress={openMyEvents} />}
				badgeColor={Brand.purpleSurface}
				icon={<CheckIcon color={Brand.purple} height={ICON} width={ICON} />}
				message={`${event.title}\nSee you at ${event.venue.name} on ${dateLabel}.`}
				onDismiss={() => setDialog("none")}
				title="You're In!"
				visible={dialog === "joined"}
			/>

			<AttendanceSheet
				busy={join.isPending || leave.isPending}
				eventDateLabel={dateLabel}
				eventTitle={event.title}
				onBackToEvents={openMyEvents}
				onConfirmCancel={confirmCancel}
				onDismiss={() => setSheet("none")}
				onKeepAttending={() => setSheet("attending")}
				onReopenCancel={() => setSheet("confirm")}
				onSelectReason={setReasonId}
				onUndoCancellation={() => runJoin(() => setSheet("attending"))}
				reasonId={reasonId}
				state={sheet}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	footer: {
		gap: Gap.snug,
		paddingTop: Spacing.two,
	},
	bar: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
		padding: Gap.snug,
		borderRadius: Radius.control,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Ink.border,
	},
	priceCopy: {
		gap: Spacing.half,
	},
	priceLabel: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	price: {
		...Type.sectionTitle,
		color: Brand.purple,
	},
	perPerson: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	cta: {
		flex: 1,
	},
	note: {
		...Type.resultMeta,
		color: Ink.meta,
		textAlign: "center",
		paddingTop: Spacing.two,
	},
	dialogActions: {
		width: "100%",
		gap: Spacing.one,
	},
	link: {
		...Type.cta,
		color: Brand.purple,
		textAlign: "center",
		paddingVertical: Spacing.two,
	},
});
