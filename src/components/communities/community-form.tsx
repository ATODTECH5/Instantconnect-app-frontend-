import type { ImagePickerOptions } from "expo-image-picker";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import SearchIcon from "@/assets/map/search.svg";
import { CoverPicker } from "@/components/events/cover-picker";
import { ToggleRow } from "@/components/settings/toggle-row";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { PersonChip } from "@/components/ui/person-chip";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectField } from "@/components/ui/select-field";
import { StackedPressableField, StackedTextField } from "@/components/ui/stacked-field";
import { Gap, Spacing } from "@/constants/theme";
import type { CommunityDraft } from "@/features/communities/community-service";
import { useUploadCommunityMedia } from "@/features/communities/use-communities";
import { usePickPhoto } from "@/features/profile/use-pick-photo";
import { CATEGORY_OPTIONS } from "@/features/reference/categories";
import { describeError } from "@/lib/api/api-error";

export const NAME_MAX = 60;
const DESCRIPTION_MAX = 500;

const COVER_OPTIONS: ImagePickerOptions = {
	mediaTypes: ["images"],
	allowsEditing: true,
	aspect: [16, 9],
	quality: 0.85,
};

export type FormPerson = { id: string; fullName: string; avatarUrl: string | null };

export type CommunityFormProps = {
	initial?: {
		name: string;
		description: string | null;
		categoryId: string | null;
		coverUrl: string | null;
		isPublic: boolean;
	};
	/** People picked so far, shown as chips under Add Members. */
	members: FormPerson[];
	onRemoveMember?: (id: string) => void;
	onAddMembers: () => void;
	submitLabel: string;
	isSubmitting: boolean;
	error: string | null;
	/** Only the fields that changed from `initial`, or every field when creating. */
	onSubmit: (draft: CommunityDraft) => void;
};

/** Create Community and Community Settings: the same fields either way. */
export function CommunityForm({
	initial,
	members,
	onRemoveMember,
	onAddMembers,
	submitLabel,
	isSubmitting,
	error,
	onSubmit,
}: CommunityFormProps) {
	const upload = useUploadCommunityMedia();
	const pickPhoto = usePickPhoto(COVER_OPTIONS);

	const [cover, setCover] = useState<{ uri: string; storageId: string | null } | null>(
		initial?.coverUrl ? { uri: initial.coverUrl, storageId: null } : null,
	);
	const [coverError, setCoverError] = useState<string | null>(null);
	const [name, setName] = useState(initial?.name ?? "");
	const [description, setDescription] = useState(initial?.description ?? "");
	const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? "social");
	const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);
	const [nameError, setNameError] = useState<string | undefined>();

	const pickCover = async () => {
		const photo = await pickPhoto();

		if (!photo) return;

		setCover({ uri: photo.uri, storageId: null });
		setCoverError(null);

		try {
			const storageId = await upload.mutateAsync({ kind: "cover", photo });

			setCover({ uri: photo.uri, storageId });
		} catch (cause) {
			setCover(initial?.coverUrl ? { uri: initial.coverUrl, storageId: null } : null);
			setCoverError(describeError(cause));
		}
	};

	const submit = () => {
		if (!name.trim()) {
			setNameError("Give your community a name.");
			return;
		}

		setNameError(undefined);

		const draft: CommunityDraft = {
			name: name.trim(),
			description: description.trim() || null,
			categoryId,
			isPublic,
			...(cover?.storageId ? { coverStorageId: cover.storageId } : {}),
		};

		if (!initial) {
			onSubmit(draft);
			return;
		}

		onSubmit({
			name: draft.name,
			isPublic: draft.isPublic,
			...(draft.description !== (initial.description ?? null)
				? { description: draft.description }
				: {}),
			...(draft.categoryId !== initial.categoryId ? { categoryId: draft.categoryId } : {}),
			...(draft.coverStorageId ? { coverStorageId: draft.coverStorageId } : {}),
		});
	};

	return (
		<View style={styles.form}>
			<CoverPicker
				emptyTitle="Upload cover image"
				error={coverError}
				onPick={() => void pickCover()}
				uploading={upload.isPending}
				uri={cover?.uri ?? null}
			/>

			<StackedTextField
				error={nameError}
				label="Community Name"
				maxLength={NAME_MAX}
				onChangeText={setName}
				placeholder="e.g., Downtown Chess Club"
				returnKeyType="done"
				value={name}
			/>

			<StackedTextField
				label="Description"
				maxLength={DESCRIPTION_MAX}
				multiline
				onChangeText={setDescription}
				placeholder="What's your community about?"
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

			<ToggleRow
				description="Anyone can find, join, and view posts in this community."
				inset={false}
				isLast
				label="Public Community"
				onChange={setIsPublic}
				value={isPublic}
			/>

			<View style={styles.members}>
				<StackedPressableField
					LeadingIcon={SearchIcon}
					accessibilityHint="Opens your connections to invite them"
					label="Add Members"
					onPress={onAddMembers}
					placeholder="Search people to invite..."
					value={null}
				/>

				{members.length > 0 && onRemoveMember ? (
					<View style={styles.chips}>
						{members.map((person) => (
							<PersonChip key={person.id} onRemove={onRemoveMember} {...person} />
						))}
					</View>
				) : null}
			</View>

			{error ? <FormErrorBanner message={error} /> : null}

			<PrimaryButton
				disabled={upload.isPending}
				label={submitLabel}
				loading={isSubmitting}
				onPress={submit}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	form: {
		gap: Gap.section,
	},
	members: {
		gap: Spacing.two,
	},
	chips: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
});
