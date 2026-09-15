import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import ClockIcon from "@/assets/search/clock.svg";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Ink, Radius, Spacing, Type } from "@/constants/theme";
import {
	formatHour,
	formatSlot,
	isPast,
	MAX_PROPOSED_TIMES,
	SLOT_HOURS,
	slotIso,
	upcomingDays,
} from "@/features/meetups/time-slots";

export type ProposeTimeSheetProps = {
	visible: boolean;
	/** "Propose a Time" when opening a meetup; "Suggest other time" when countering. */
	title: string;
	isSending: boolean;
	onSend: (proposedTimes: string[]) => void;
	onDismiss: () => void;
};

/**
 * The design's Propose a Time card: time pills, add another, send. Built as a
 * day strip by an hour grid so no native picker is needed. Tapping a slot
 * adds a pill; tapping a pill removes it. Past slots on today are hidden
 * rather than disabled, since offering a time that has gone is never right.
 */
export function ProposeTimeSheet({
	visible,
	title,
	isSending,
	onSend,
	onDismiss,
}: ProposeTimeSheetProps) {
	const days = useMemo(() => upcomingDays(), []);
	const [dayKey, setDayKey] = useState(days[0].key);
	const [picked, setPicked] = useState<string[]>([]);
	const day = days.find((d) => d.key === dayKey) ?? days[0];
	const full = picked.length >= MAX_PROPOSED_TIMES;

	const toggle = useCallback((iso: string) => {
		setPicked((current) =>
			current.includes(iso)
				? current.filter((item) => item !== iso)
				: current.length >= MAX_PROPOSED_TIMES
					? current
					: [...current, iso].sort(),
		);
	}, []);

	const send = useCallback(() => {
		if (picked.length === 0 || isSending) return;

		onSend(picked);
	}, [isSending, onSend, picked]);

	const slots = SLOT_HOURS.map((hour) => slotIso(day.date, hour)).filter(
		(iso) => !isPast(iso),
	);

	return (
		<BottomSheet
			actions={
				<PrimaryButton
					accessibilityHint="Sends these times to the other person"
					disabled={picked.length === 0}
					label="Send Proposal"
					loading={isSending}
					onPress={send}
				/>
			}
			badgeColor={Brand.purpleSurface}
			icon={<ClockIcon color={Brand.purple} height={22} width={22} />}
			message={
				picked.length === 0
					? "Pick up to five times that work for you."
					: `${picked.length} of ${MAX_PROPOSED_TIMES} chosen`
			}
			onDismiss={onDismiss}
			title={title}
			visible={visible}
		>
			<View style={styles.body}>
				{picked.length > 0 ? (
					<View style={styles.pills}>
						{picked.map((iso) => (
							<Pressable
								accessibilityHint="Removes this time"
								accessibilityLabel={formatSlot(iso)}
								accessibilityRole="button"
								key={iso}
								onPress={() => toggle(iso)}
								style={styles.pill}
							>
								<Text style={styles.pillLabel}>{formatSlot(iso)}</Text>
								<Text style={styles.pillRemove}>×</Text>
							</Pressable>
						))}
					</View>
				) : null}

				<ScrollView
					contentContainerStyle={styles.days}
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.dayStrip}
				>
					{days.map((option) => {
						const selected = option.key === dayKey;

						return (
							<Pressable
								accessibilityRole="tab"
								accessibilityState={{ selected }}
								key={option.key}
								onPress={() => setDayKey(option.key)}
								style={[styles.day, selected && styles.daySelected]}
							>
								<Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
									{option.label}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>

				<View style={styles.grid}>
					{slots.length === 0 ? (
						<Text style={styles.empty}>No more slots today. Try tomorrow.</Text>
					) : (
						slots.map((iso) => {
							const chosen = picked.includes(iso);
							const hour = new Date(iso).getHours();

							return (
								<Pressable
									accessibilityRole="checkbox"
									accessibilityState={{ checked: chosen, disabled: !chosen && full }}
									disabled={!chosen && full}
									key={iso}
									onPress={() => toggle(iso)}
									style={[
										styles.slot,
										chosen && styles.slotChosen,
										!chosen && full && styles.slotDisabled,
									]}
								>
									<Text style={[styles.slotLabel, chosen && styles.slotLabelChosen]}>
										{formatHour(hour)}
									</Text>
								</Pressable>
							);
						})
					)}
				</View>
			</View>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	body: {
		alignSelf: "stretch",
		gap: Spacing.three,
	},
	dayStrip: {
		flexGrow: 0,
	},
	pills: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	pill: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurface,
	},
	pillLabel: {
		...Type.cardAction,
		color: Brand.purple,
	},
	pillRemove: {
		...Type.action,
		color: Brand.purple,
	},
	days: {
		gap: Spacing.two,
	},
	day: {
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
		borderRadius: Radius.pill,
		borderWidth: 1,
		borderColor: Ink.border,
	},
	daySelected: {
		backgroundColor: Brand.purple,
		borderColor: Brand.purple,
	},
	dayLabel: {
		...Type.chipLabel,
		color: Ink.body,
	},
	dayLabelSelected: {
		color: Brand.onBrand,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	slot: {
		width: "31%",
		paddingVertical: Spacing.three,
		borderRadius: Radius.control,
		borderWidth: 1,
		borderColor: Ink.border,
		alignItems: "center",
	},
	slotChosen: {
		backgroundColor: Brand.purpleSurface,
		borderColor: Brand.purple,
	},
	slotDisabled: {
		opacity: 0.4,
	},
	slotLabel: {
		...Type.action,
		color: Ink.body,
	},
	slotLabelChosen: {
		color: Brand.purple,
	},
	empty: {
		...Type.cardMeta,
		color: Ink.muted,
	},
});
