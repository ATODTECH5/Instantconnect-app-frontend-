import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { useState } from "react";
import { Platform, StyleSheet } from "react-native";

import CalendarIcon from "@/assets/events/calendar.svg";
import ClockIcon from "@/assets/search/clock.svg";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StackedPressableField } from "@/components/ui/stacked-field";
import { Brand } from "@/constants/theme";
import { formatClock, formatShortDate } from "@/utils/format";

export type DateTimeFieldProps = {
	label: string;
	mode: "date" | "time";
	value: Date | null;
	onChange: (value: Date) => void;
	placeholder: string;
	/** What the picker opens on while there is no value yet. */
	initial: Date;
	minimumDate?: Date;
	error?: string;
};

/**
 * One half of a date and time pair. Each half edits only its own part of the
 * same instant, so picking a time never moves the day and the reverse.
 */
export function DateTimeField({
	label,
	mode,
	value,
	onChange,
	placeholder,
	initial,
	minimumDate,
	error,
}: DateTimeFieldProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [draft, setDraft] = useState<Date>(value ?? initial);

	const base = value ?? initial;
	const formatted = value
		? mode === "date"
			? formatShortDate(value)
			: formatClock(value)
		: null;

	const open = () => {
		setDraft(base);
		setIsOpen(true);
	};

	const commit = (picked: Date) => {
		onChange(mergePart(base, picked, mode));
		setIsOpen(false);
	};

	return (
		<>
			<StackedPressableField
				TrailingIcon={mode === "date" ? CalendarIcon : ClockIcon}
				accessibilityHint={mode === "date" ? "Opens a calendar" : "Opens a time picker"}
				error={error}
				label={label}
				onPress={open}
				placeholder={placeholder}
				value={formatted}
			/>

			{Platform.OS === "android" ? (
				// The Material picker is a dialog that shows on mount and reports
				// once, so it is mounted only while open.
				isOpen ? (
					<DateTimePicker
						accentColor={Brand.purple}
						minimumDate={mode === "date" ? minimumDate : undefined}
						mode={mode}
						onDismiss={() => setIsOpen(false)}
						onValueChange={(_event, picked) => commit(picked)}
						presentation="dialog"
						value={base}
					/>
				) : null
			) : (
				<BottomSheet
					actions={<PrimaryButton label="Done" onPress={() => commit(draft)} />}
					message={null}
					onDismiss={() => setIsOpen(false)}
					title={mode === "date" ? "Pick a date" : "Pick a time"}
					visible={isOpen}
				>
					<DateTimePicker
						accentColor={Brand.purple}
						display={mode === "date" ? "inline" : "spinner"}
						minimumDate={mode === "date" ? minimumDate : undefined}
						mode={mode}
						onValueChange={(_event, picked) => setDraft(picked)}
						style={styles.picker}
						value={draft}
					/>
				</BottomSheet>
			)}
		</>
	);
}

function mergePart(base: Date, picked: Date, mode: "date" | "time"): Date {
	const next = new Date(base);

	if (mode === "date") {
		next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
	} else {
		next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
	}

	return next;
}

const styles = StyleSheet.create({
	picker: {
		alignSelf: "stretch",
	},
});
