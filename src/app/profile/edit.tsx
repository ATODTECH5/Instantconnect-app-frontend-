import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackIcon from "@/assets/auth/arrow-left.svg";
import ChevronDownIcon from "@/assets/search/chevron-down.svg";
import { PhotoGallery } from "@/components/profile/photo-gallery";
import { PickerSheet } from "@/components/profile/picker-sheet";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Toast } from "@/components/ui/toast";
import {
	Brand,
	Gap,
	Ink,
	MaxColumnWidth,
	MinTapTarget,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import type { ProfileChanges } from "@/features/profile/profile-service";
import { usePickPhoto } from "@/features/profile/use-pick-photo";
import {
	useHobbies,
	useOccupations,
	useProfile,
	useRemovePhoto,
	useUpdateProfile,
	useUploadPhoto,
} from "@/features/profile/use-profile";
import { CATEGORIES } from "@/features/reference/categories";
import { isApiError } from "@/lib/api/api-error";
import type { ApiProfile } from "@/lib/api/profile-schema";

const AVATAR_SIZE = 96;
const AVATAR_POSITION = 0;
const CHEVRON_SIZE = 20;

type Draft = {
	fullName: string;
	username: string;
	bio: string;
	locationLabel: string;
	categoryId: string | null;
	occupationId: string | null;
	hobbyIds: string[];
};

type Notice = { message: string; tone: "success" | "error" };

type OpenPicker = "category" | "occupation" | "hobbies" | null;

/**
 * The server writes 4xx messages to be shown as written, so a rejected username
 * or an unknown id already reads correctly. Anything else is ours to explain.
 */
function saveErrorMessage(cause: unknown): string {
	if (isApiError(cause) && cause.status >= 400 && cause.status < 500) {
		return cause.message;
	}

	return "We could not save your changes. Please try again.";
}

/**
 * An upload crosses three hops (our signature, the provider, our confirmation)
 * and each fails for its own reason, so the reason is shown rather than
 * discarded. Swallowing it leaves a broken slot with nothing to act on, which
 * is indistinguishable from the network being down.
 */
function photoErrorMessage(cause: unknown): string {
	if (isApiError(cause)) return cause.message;

	return "That photo could not be uploaded. Please try again.";
}

function draftFrom(profile: ApiProfile): Draft {
	return {
		fullName: profile.fullName,
		username: profile.username ?? "",
		bio: profile.bio ?? "",
		locationLabel: profile.locationLabel ?? "",
		categoryId: profile.category?.id ?? null,
		occupationId: profile.occupation?.id ?? null,
		hobbyIds: profile.hobbies.map((hobby) => hobby.id),
	};
}

export default function EditProfileScreen() {
	const profile = useProfile();

	if (profile.isPending) {
		return (
			<Screen>
				<View style={styles.centre}>
					<GradientSpinner />

					<Text style={styles.loadingLabel}>Loading your profile</Text>
				</View>
			</Screen>
		);
	}

	if (profile.isError || !profile.data) {
		return (
			<Screen>
				<View style={styles.centre}>
					<StateMessage
						actionLabel="Try again"
						isError
						message="We could not load your profile. Check your connection and try again."
						onPressAction={() => void profile.refetch()}
					/>
				</View>
			</Screen>
		);
	}

	// Keyed by account so the draft seeds from the server exactly once. Later
	// refetches update the photos, which are read from the prop, without
	// discarding text the user is part way through editing.
	return <EditProfileForm key={profile.data.id} profile={profile.data} />;
}

function EditProfileForm({ profile }: { profile: ApiProfile }) {
	const occupations = useOccupations();
	const hobbies = useHobbies();

	const pickPhoto = usePickPhoto();
	const update = useUpdateProfile();
	const uploadPhoto = useUploadPhoto();
	const removePhoto = useRemovePhoto();

	const [draft, setDraft] = useState<Draft>(() => draftFrom(profile));
	const [picker, setPicker] = useState<OpenPicker>(null);
	const [busyPosition, setBusyPosition] = useState<number | null>(null);
	const [notice, setNotice] = useState<Notice | null>(null);

	const edit = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
		setNotice(null);
		setDraft((current) => ({ ...current, [key]: value }));
	}, []);

	const occupationLabel = useMemo(
		() => occupations.data?.find((entry) => entry.id === draft.occupationId)?.label ?? null,
		[occupations.data, draft.occupationId],
	);

	const categoryLabel = useMemo(
		() => CATEGORIES.find((entry) => entry.id === draft.categoryId)?.label ?? null,
		[draft.categoryId],
	);

	const selectedHobbies = useMemo(
		() => (hobbies.data ?? []).filter((hobby) => draft.hobbyIds.includes(hobby.id)),
		[hobbies.data, draft.hobbyIds],
	);

	const changePhoto = useCallback(
		async (position: number) => {
			const photo = await pickPhoto();

			if (!photo) return;

			setNotice(null);
			setBusyPosition(position);

			try {
				await uploadPhoto.mutateAsync({ position, photo });
			} catch (cause) {
				setNotice({ message: photoErrorMessage(cause), tone: "error" });
			} finally {
				setBusyPosition(null);
			}
		},
		[pickPhoto, uploadPhoto],
	);

	const deletePhoto = useCallback(
		async (position: number) => {
			setNotice(null);
			setBusyPosition(position);

			try {
				await removePhoto.mutateAsync(position);
			} catch (cause) {
				setNotice({ message: photoErrorMessage(cause), tone: "error" });
			} finally {
				setBusyPosition(null);
			}
		},
		[removePhoto],
	);

	const save = useCallback(async () => {
		const trimmedName = draft.fullName.trim();

		if (trimmedName.length < 2) {
			setNotice({ message: "Enter your name.", tone: "error" });
			return;
		}

		const changes: ProfileChanges = {
			fullName: trimmedName,
			username: draft.username.trim() || null,
			bio: draft.bio.trim() || null,
			locationLabel: draft.locationLabel.trim() || null,
			occupationId: draft.occupationId,
			hobbyIds: draft.hobbyIds,
		};

		if (draft.categoryId) changes.categoryId = draft.categoryId;

		try {
			await update.mutateAsync(changes);
			setNotice({ message: "Your changes has been saved", tone: "success" });
		} catch (cause) {
			setNotice({ message: saveErrorMessage(cause), tone: "error" });
		}
	}, [draft, update]);

	return (
		<Screen>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.fill}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{notice ? (
						<Toast
							message={notice.message}
							onDismiss={() => setNotice(null)}
							tone={notice.tone}
						/>
					) : null}

					<View style={styles.photos}>
						<ProfileAvatar
							fullName={draft.fullName}
							isBusy={busyPosition === AVATAR_POSITION}
							onPressCamera={() => void changePhoto(AVATAR_POSITION)}
							size={AVATAR_SIZE}
							uri={profile.avatarUrl}
						/>

						<PhotoGallery
							busyPosition={busyPosition}
							onAdd={(position) => void changePhoto(position)}
							onRemove={(position) => void deletePhoto(position)}
							photos={profile.photos}
						/>
					</View>

					<View style={styles.fields}>
						<TextRow
							label="Edit Name"
							onChangeText={(value) => edit("fullName", value)}
							placeholder="Your name"
							value={draft.fullName}
						/>

						<TextRow
							autoCapitalize="none"
							label="Username"
							onChangeText={(value) => edit("username", value.replace(/^@/, ""))}
							placeholder="username"
							prefix="@"
							value={draft.username}
						/>

						<TextRow
							label="Bio"
							multiline
							onChangeText={(value) => edit("bio", value)}
							placeholder="Tell people about yourself"
							value={draft.bio}
						/>

						<PickerRow
							label="Occupation"
							onPress={() => setPicker("occupation")}
							placeholder="Select occupation"
							value={occupationLabel}
						/>

						<TextRow
							label="Location"
							onChangeText={(value) => edit("locationLabel", value)}
							placeholder="City, State"
							value={draft.locationLabel}
						/>

						<PickerRow
							accent
							label="Category"
							onPress={() => setPicker("category")}
							placeholder="Select category"
							value={categoryLabel}
						/>

						<Pressable
							accessibilityHint="Opens the hobby picker"
							accessibilityLabel={`Hobbies. ${
								selectedHobbies.map((hobby) => hobby.label).join(", ") ||
								"None chosen"
							}`}
							accessibilityRole="button"
							onPress={() => setPicker("hobbies")}
							style={({ pressed }) => [styles.row, pressed && styles.pressed]}
						>
							<Text style={styles.rowLabel}>Hobbies</Text>

							<View style={styles.hobbies}>
								{selectedHobbies.length === 0 ? (
									<Text style={styles.placeholder}>Select hobbies</Text>
								) : (
									selectedHobbies.map((hobby) => (
										<View key={hobby.id} style={styles.hobbyChip}>
											<Text style={styles.hobbyLabel}>{hobby.label}</Text>
										</View>
									))
								)}
							</View>

							<ChevronDownIcon
								color={Ink.muted}
								height={CHEVRON_SIZE}
								width={CHEVRON_SIZE}
							/>
						</Pressable>
					</View>

					<PrimaryButton
						disabled={update.isPending}
						label={update.isPending ? "Saving..." : "Save"}
						onPress={() => void save()}
					/>
				</ScrollView>
			</KeyboardAvoidingView>

			<PickerSheet
				onChange={(ids) => edit("occupationId", ids[0] ?? null)}
				onClose={() => setPicker(null)}
				options={occupations.data ?? []}
				searchable
				title="Occupation"
				value={draft.occupationId ? [draft.occupationId] : []}
				visible={picker === "occupation"}
			/>

			<PickerSheet
				onChange={(ids) => edit("categoryId", ids[0] ?? null)}
				onClose={() => setPicker(null)}
				options={CATEGORIES.map(({ id, label, Icon }) => ({ id, label, Icon }))}
				title="Category"
				value={draft.categoryId ? [draft.categoryId] : []}
				visible={picker === "category"}
			/>

			<PickerSheet
				multiple
				onChange={(ids) => edit("hobbyIds", ids)}
				onClose={() => setPicker(null)}
				options={hobbies.data ?? []}
				title="Select Hobbies"
				value={draft.hobbyIds}
				visible={picker === "hobbies"}
			/>
		</Screen>
	);
}

function Screen({ children }: { children: React.ReactNode }) {
	return (
		<SafeAreaView edges={["top"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.header}>
				<Pressable
					accessibilityLabel="Go back"
					accessibilityRole="button"
					hitSlop={12}
					onPress={() => router.back()}
					style={({ pressed }) => [styles.back, pressed && styles.pressed]}
				>
					<BackIcon color={Ink.title} height={20} width={20} />
				</Pressable>

				<Text accessibilityRole="header" style={styles.screenTitle}>
					Edit Profile
				</Text>
			</View>

			{children}
		</SafeAreaView>
	);
}

function TextRow({
	label,
	value,
	onChangeText,
	placeholder,
	multiline = false,
	prefix,
	autoCapitalize = "sentences",
}: {
	label: string;
	value: string;
	onChangeText: (value: string) => void;
	placeholder: string;
	multiline?: boolean;
	prefix?: string;
	autoCapitalize?: "none" | "sentences";
}) {
	return (
		<View style={styles.row}>
			<Text style={styles.rowLabel}>{label}</Text>

			<View style={styles.inputWrap}>
				{prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}

				<TextInput
					accessibilityLabel={label}
					autoCapitalize={autoCapitalize}
					autoCorrect={!prefix}
					multiline={multiline}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor={Ink.placeholder}
					style={[styles.input, multiline && styles.inputMultiline]}
					value={value}
				/>
			</View>
		</View>
	);
}

function PickerRow({
	label,
	value,
	placeholder,
	onPress,
	accent = false,
}: {
	label: string;
	value: string | null;
	placeholder: string;
	onPress: () => void;
	accent?: boolean;
}) {
	return (
		<Pressable
			accessibilityHint={`Opens the ${label.toLowerCase()} picker`}
			accessibilityLabel={`${label}. ${value ?? placeholder}`}
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			<Text style={styles.rowLabel}>{label}</Text>

			<Text
				numberOfLines={1}
				style={[
					styles.rowValue,
					!value && styles.placeholder,
					value && accent && styles.accentValue,
				]}
			>
				{value ?? placeholder}
			</Text>

			<ChevronDownIcon color={Ink.muted} height={CHEVRON_SIZE} width={CHEVRON_SIZE} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	fill: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: Spacing.three,
		paddingBottom: Spacing.two,
	},
	back: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	screenTitle: {
		...Type.screenTitle,
		color: Ink.title,
	},
	content: {
		flexGrow: 1,
		gap: Spacing.four,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		paddingBottom: Spacing.five,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
	},
	loadingLabel: {
		...Type.profileMeta,
		color: Ink.muted,
	},
	centre: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.two,
		paddingHorizontal: Spacing.three,
	},
	photos: {
		alignItems: "center",
		gap: Spacing.three,
		paddingVertical: Spacing.four,
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.media,
		backgroundColor: Ink.keypad,
		alignSelf: "stretch",
	},
	fields: {
		gap: Spacing.two,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget,
		paddingVertical: Spacing.two,
		borderBottomWidth: 1,
		borderBottomColor: Ink.rowBorder,
	},
	rowLabel: {
		...Type.fieldLabel,
		width: 88,
		color: Ink.title,
	},
	inputWrap: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
	},
	prefix: {
		...Type.fieldValue,
		color: Ink.muted,
	},
	input: {
		...Type.fieldValue,
		flex: 1,
		paddingVertical: Spacing.one,
		color: Ink.title,
	},
	inputMultiline: {
		minHeight: 44,
		textAlignVertical: "top",
	},
	rowValue: {
		...Type.fieldValue,
		flex: 1,
		color: Ink.title,
	},
	accentValue: {
		color: Brand.purple,
	},
	placeholder: {
		color: Ink.placeholder,
	},
	hobbies: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.one,
	},
	hobbyChip: {
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.one,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurface,
	},
	hobbyLabel: {
		...Type.badgeLabel,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
