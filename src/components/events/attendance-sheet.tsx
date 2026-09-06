import { StyleSheet, Text, View } from "react-native";

import AlertIcon from "@/assets/auth/alert-circle.svg";
import CheckIcon from "@/assets/auth/check.svg";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Ink, Spacing, Type } from "@/constants/theme";

const ICON = 28;

/** Which of the three attendance sheets is showing, if any. */
export type AttendanceSheetState = "none" | "confirm" | "cancelled" | "attending";

export const CANCEL_REASONS: ChipOption[] = [
	{ id: "changed-plans", label: "Changed plans" },
	{ id: "cannot-make-it", label: "Can't make it" },
	{ id: "safety-concern", label: "Safety concern" },
	{ id: "other", label: "Other" },
];

export type AttendanceSheetProps = {
	state: AttendanceSheetState;
	eventTitle: string;
	eventDateLabel: string;
	reasonId: string | null;
	onSelectReason: (id: string) => void;
	onConfirmCancel: () => void;
	onKeepAttending: () => void;
	/** Reopens the confirm sheet from the "still attending" state. */
	onReopenCancel: () => void;
	onBackToEvents: () => void;
	onUndoCancellation: () => void;
	onDismiss: () => void;
};

export function AttendanceSheet({
	state,
	eventTitle,
	eventDateLabel,
	reasonId,
	onSelectReason,
	onConfirmCancel,
	onKeepAttending,
	onReopenCancel,
	onBackToEvents,
	onUndoCancellation,
	onDismiss,
}: AttendanceSheetProps) {
	if (state === "confirm") {
		return (
			<BottomSheet
				actions={
					<>
						<PrimaryButton
							label="Yes, Cancel Attendance"
							onPress={onConfirmCancel}
							tone="danger"
						/>

						<Text
							accessibilityRole="button"
							onPress={onKeepAttending}
							style={styles.link}
						>
							Keep Attending
						</Text>
					</>
				}
				badgeColor={Ink.dangerSurface}
				icon={<AlertIcon color={Ink.danger} height={ICON} width={ICON} />}
				message={
					<Text style={styles.message}>
						Are you sure you want to cancel your attendance to{" "}
						<Text style={styles.emphasis}>{eventTitle}</Text>?
					</Text>
				}
				onDismiss={onDismiss}
				title="Cancel Attendance?"
				visible
			>
				<View style={styles.reasons}>
					<Text style={styles.reasonLabel}>SELECT A REASON</Text>

					<ChipGroup
						accessibilityLabel="Reason for cancelling"
						onSelect={onSelectReason}
						options={CANCEL_REASONS}
						selectedId={reasonId}
					/>
				</View>
			</BottomSheet>
		);
	}

	if (state === "cancelled") {
		return (
			<BottomSheet
				actions={
					<>
						<PrimaryButton
							label="Back to Events"
							onPress={onBackToEvents}
							tone="danger"
						/>

						<Text
							accessibilityRole="button"
							onPress={onUndoCancellation}
							style={styles.link}
						>
							Undo Cancellation
						</Text>
					</>
				}
				badgeColor={Ink.dangerSurface}
				icon={<CheckIcon color={Ink.danger} height={ICON} width={ICON} />}
				message={
					<Text style={styles.message}>
						Your attendance to <Text style={styles.emphasis}>{eventTitle}</Text> has
						been cancelled successfully.
					</Text>
				}
				onDismiss={onDismiss}
				title="Attendance Cancelled"
				visible
			/>
		);
	}

	if (state === "attending") {
		return (
			<BottomSheet
				actions={
					<>
						<PrimaryButton label="Back to Events" onPress={onBackToEvents} />

						<Text
							accessibilityRole="button"
							onPress={onReopenCancel}
							style={styles.link}
						>
							Cancel Attendance
						</Text>
					</>
				}
				badgeColor={Brand.purpleSurface}
				icon={<CheckIcon color={Brand.purple} height={ICON} width={ICON} />}
				message={
					<Text style={styles.message}>
						Great! We&apos;ll see you at{" "}
						<Text style={styles.emphasis}>{eventTitle}</Text> on {eventDateLabel}.
					</Text>
				}
				onDismiss={onDismiss}
				title="You're Still Attending!"
				visible
			/>
		);
	}

	return null;
}

const styles = StyleSheet.create({
	message: {
		...Type.dialogBody,
		color: Ink.muted,
		textAlign: "center",
	},
	emphasis: {
		...Type.dialogBody,
		color: Ink.title,
		fontWeight: "600",
	},
	reasons: {
		width: "100%",
		gap: Spacing.two,
	},
	reasonLabel: {
		...Type.badgeLabel,
		color: Ink.meta,
		letterSpacing: 0.5,
	},
	link: {
		...Type.cta,
		color: Ink.title,
		textAlign: "center",
		paddingVertical: Spacing.two,
	},
});
