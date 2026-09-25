import type { ImagePickerOptions } from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PinIcon from "@/assets/home/pin.svg";
import SearchIcon from "@/assets/map/search.svg";
import ChevronRightIcon from "@/assets/profile/chevron-right.svg";
import { CoverPicker } from "@/components/events/cover-picker";
import { type Invitee, InviteSheet } from "@/components/events/invite-sheet";
import { LocationSheet } from "@/components/events/location-sheet";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ToggleRow } from "@/components/settings/toggle-row";
import { DateTimeField } from "@/components/ui/date-time-field";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { PersonChip } from "@/components/ui/person-chip";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectField } from "@/components/ui/select-field";
import { StackedPressableField, StackedTextField } from "@/components/ui/stacked-field";
import { Brand, Gap, Ink, MaxColumnWidth, MinTapTarget, Spacing, Type } from "@/constants/theme";
import { useCreateEvent, useUploadEventCover } from "@/features/events/use-events";
import type { VenueCandidate } from "@/features/location/geocoding";
import { usePickPhoto } from "@/features/profile/use-pick-photo";
import { CATEGORY_OPTIONS } from "@/features/reference/categories";
import { describeError } from "@/lib/api/api-error";

const TITLE_MAX = 80;
const DESCRIPTION_MAX = 1000;
const HOUR_MS = 60 * 60 * 1000;

/** Landscape, to match the 16:9 box it fills on every event surface. */
const COVER_OPTIONS: ImagePickerOptions = {
	mediaTypes: ["images"],
	allowsEditing: true,
	aspect: [16, 9],
	quality: 0.85,
};

const TICKET_OPTIONS = [
	{ id: "free", label: "Free" },
	{ id: "paid", label: "Paid" },
];

type Cover = { uri: string; storageId: string | null };

type Errors = Partial<Record<"title" | "startsAt" | "endsAt" | "venue" | "price", string>>;

/** The start of the next full hour, one hour out, so the default is always bookable. */
function suggestedStart(): Date {
	const next = new Date(Date.now() + HOUR_MS);

	next.setMinutes(0, 0, 0);

	return new Date(next.getTime() + HOUR_MS);
}

/** `time`'s clock reading on `day`'s date. */
function onDayOf(day: Date, time: Date): Date {
	const merged = new Date(day);

	merged.setHours(time.getHours(), time.getMinutes(), 0, 0);

	return merged;
}

/** "5,000" or "5000.50" to kobo; null for anything that is not a positive amount. */
function toKobo(input: string): number | null {
	const naira = Number(input.replace(/,/g, "").trim());

	if (!Number.isFinite(naira) || naira <= 0) return null;

	return Math.round(naira * 100);
}

export default function NewEventScreen() {
	const create = useCreateEvent();
	const upload = useUploadEventCover();
	const pickPhoto = usePickPhoto(COVER_OPTIONS);
	const [initialStart] = useState(suggestedStart);

	const [cover, setCover] = useState<Cover | null>(null);
	const [coverError, setCoverError] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [startsAt, setStartsAt] = useState<Date | null>(null);
	const [hasEnd, setHasEnd] = useState(false);
	const [endsAt, setEndsAt] = useState<Date | null>(null);
	const [venue, setVenue] = useState<VenueCandidate | null>(null);
	const [description, setDescription] = useState("");
	const [categoryId, setCategoryId] = useState<string | null>(null);
	const [ticket, setTicket] = useState<"free" | "paid">("free");
	const [price, setPrice] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const [invitees, setInvitees] = useState<Invitee[]>([]);
	const [sheet, setSheet] = useState<"none" | "location" | "invite">("none");
	const [errors, setErrors] = useState<Errors>({});

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/profile/create-event");
	}, []);

	const pickCover = useCallback(async () => {
		const photo = await pickPhoto();

		if (!photo) return;

		setCover({ uri: photo.uri, storageId: null });
		setCoverError(null);

		try {
			const storageId = await upload.mutateAsync(photo);

			setCover({ uri: photo.uri, storageId });
		} catch (cause) {
			setCover(null);
			setCoverError(describeError(cause));
		}
	}, [pickPhoto, upload]);

	const changeStart = useCallback((next: Date) => {
		setStartsAt(next);
		setEndsAt((end) => (end ? onDayOf(next, end) : end));
	}, []);

	const removeInvitee = useCallback((id: string) => {
		setInvitees((current) => current.filter((person) => person.id !== id));
	}, []);

	const validate = (): Errors => {
		const next: Errors = {};

		if (!title.trim()) next.title = "Give your event a title.";

		if (!startsAt) next.startsAt = "Pick a date and time.";
		else if (startsAt.getTime() <= Date.now()) next.startsAt = "Pick a time in the future.";

		if (hasEnd && startsAt) {
			if (!endsAt) next.endsAt = "Pick an end time, or remove it.";
			else if (endsAt.getTime() <= startsAt.getTime()) {
				next.endsAt = "The end time must be after the start.";
			}
		}

		if (!venue) next.venue = "Choose where it is happening.";

		if (ticket === "paid" && toKobo(price) === null) next.price = "Enter a price above zero.";

		return next;
	};

	const submit = () => {
		const found = validate();

		setErrors(found);

		if (Object.keys(found).length > 0 || !startsAt || !venue) return;

		create.mutate(
			{
				title: title.trim(),
				description: description.trim() || undefined,
				startsAt: startsAt.toISOString(),
				endsAt: hasEnd && endsAt ? endsAt.toISOString() : undefined,
				venue: {
					name: venue.name,
					address: venue.address ?? undefined,
					latitude: venue.latitude,
					longitude: venue.longitude,
				},
				categoryId: categoryId ?? undefined,
				priceMinor: ticket === "paid" ? (toKobo(price) ?? 0) : 0,
				isPublic,
				coverStorageId: cover?.storageId ?? undefined,
				inviteeIds: invitees.map((person) => person.id),
			},
			{ onSuccess: (event) => router.replace(`/events/hosted/${event.id}`) },
		);
	};

	// The end is a time on the start's day, and follows the start when it moves.
	const endBase = startsAt ?? initialStart;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.column}
			>
				<ScreenHeader onBack={goBack} title="Create Event" />

				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<CoverPicker
						error={coverError}
						onPick={() => void pickCover()}
						uploading={upload.isPending}
						uri={cover?.uri ?? null}
					/>

					<StackedTextField
						error={errors.title}
						label="Event Title"
						maxLength={TITLE_MAX}
						onChangeText={setTitle}
						placeholder="e.g., Morning Coffee Hangout"
						returnKeyType="done"
						value={title}
					/>

					<View style={styles.pair}>
						<View style={styles.half}>
							<DateTimeField
								error={errors.startsAt}
								initial={initialStart}
								label="Date"
								minimumDate={new Date()}
								mode="date"
								onChange={changeStart}
								placeholder="Pick a date"
								value={startsAt}
							/>
						</View>

						<View style={styles.half}>
							<DateTimeField
								initial={initialStart}
								label="Time"
								mode="time"
								onChange={changeStart}
								placeholder="Pick a time"
								value={startsAt}
							/>
						</View>
					</View>

					{hasEnd ? (
						<View style={styles.endRow}>
							<View style={styles.half}>
								<DateTimeField
									error={errors.endsAt}
									initial={new Date(endBase.getTime() + 2 * HOUR_MS)}
									label="End time"
									mode="time"
									onChange={(picked) => setEndsAt(onDayOf(endBase, picked))}
									placeholder="Pick a time"
									value={endsAt}
								/>
							</View>

							<TextLink
								label="Remove"
								onPress={() => {
									setHasEnd(false);
									setEndsAt(null);
								}}
							/>
						</View>
					) : (
						<TextLink label="+ Add end time" onPress={() => setHasEnd(true)} />
					)}

					<StackedPressableField
						LeadingIcon={PinIcon}
						TrailingIcon={ChevronRightIcon}
						accessibilityHint="Opens place search"
						error={errors.venue}
						label="Location"
						onPress={() => setSheet("location")}
						placeholder="Search for a place"
						value={
							venue ? [venue.name, venue.address].filter(Boolean).join(", ") : null
						}
					/>

					<StackedTextField
						label="Description"
						maxLength={DESCRIPTION_MAX}
						multiline
						onChangeText={setDescription}
						placeholder="Tell people what your event is about...."
						value={description}
					/>

					<SelectField
						accessibilityLabel="Category"
						clearLabel="No category"
						label="Category"
						onChange={setCategoryId}
						options={CATEGORY_OPTIONS}
						placeholder="Choose a category"
						sheetTitle="Categories"
						value={categoryId}
						variant="stacked"
					/>

					<SelectField
						accessibilityLabel="Ticket"
						clearLabel={null}
						label="Ticket"
						onChange={(id) => setTicket(id === "paid" ? "paid" : "free")}
						options={TICKET_OPTIONS}
						placeholder="Free"
						sheetTitle="Ticket"
						value={ticket}
						variant="stacked"
					/>

					{ticket === "paid" ? (
						<View style={styles.priceBlock}>
							<StackedTextField
								error={errors.price}
								keyboardType="decimal-pad"
								label="Event Price (₦)"
								onChangeText={setPrice}
								placeholder="Enter amount"
								value={price}
							/>

							<Text style={styles.note}>
								Guests will see this price. Ticket payments are not available yet.
							</Text>
						</View>
					) : null}

					<ToggleRow
						description="Anyone can find, join, and attend this event."
						inset={false}
						isLast
						label="Publish to Public"
						onChange={setIsPublic}
						value={isPublic}
					/>

					<View style={styles.invite}>
						<StackedPressableField
							LeadingIcon={SearchIcon}
							accessibilityHint="Opens your connections to pick who to invite"
							label="Invite People"
							onPress={() => setSheet("invite")}
							placeholder="Search people to invite..."
							value={null}
						/>

						{invitees.length > 0 ? (
							<View style={styles.chips}>
								{invitees.map((person) => (
									<PersonChip
										key={person.id}
										onRemove={removeInvitee}
										{...person}
									/>
								))}
							</View>
						) : null}
					</View>

					{create.isError ? (
						<FormErrorBanner message={describeError(create.error)} />
					) : null}

					<PrimaryButton
						disabled={upload.isPending}
						label="Create Event"
						loading={create.isPending}
						onPress={submit}
					/>
				</ScrollView>
			</KeyboardAvoidingView>

			<LocationSheet
				onDismiss={() => setSheet("none")}
				onPick={(picked) => {
					setVenue(picked);
					setErrors((current) => ({ ...current, venue: undefined }));
					setSheet("none");
				}}
				visible={sheet === "location"}
			/>

			<InviteSheet
				onDismiss={() => setSheet("none")}
				onDone={(picked) => {
					setInvitees(picked);
					setSheet("none");
				}}
				selected={invitees}
				visible={sheet === "invite"}
			/>
		</SafeAreaView>
	);
}

function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
	return (
		<Pressable
			accessibilityLabel={label.replace("+ ", "")}
			accessibilityRole="button"
			hitSlop={Spacing.two}
			onPress={onPress}
			style={({ pressed }) => [styles.link, pressed && styles.pressed]}
		>
			<Text style={styles.linkLabel}>{label}</Text>
		</Pressable>
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
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	content: {
		flexGrow: 1,
		gap: Gap.section,
		paddingBottom: Spacing.five,
	},
	pair: {
		flexDirection: "row",
		gap: Gap.card,
	},
	half: {
		flex: 1,
	},
	endRow: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: Gap.card,
	},
	link: {
		alignSelf: "flex-start",
		minHeight: MinTapTarget,
		justifyContent: "center",
	},
	linkLabel: {
		...Type.sectionLink,
		color: Brand.purple,
	},
	priceBlock: {
		gap: Spacing.two,
	},
	note: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	invite: {
		gap: Spacing.two,
	},
	chips: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	pressed: {
		opacity: 0.7,
	},
});
