import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommunityForm } from "@/components/communities/community-form";
import { CommunityInviteSheet } from "@/components/communities/community-invite-sheet";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Spacing } from "@/constants/theme";
import {
	useCommunity,
	useDeleteCommunity,
	useUpdateCommunity,
} from "@/features/communities/use-communities";
import { describeError } from "@/lib/api/api-error";

/** Admins only; the community screen hides the gear from everyone else. */
export default function CommunitySettingsScreen() {
	const { id = "" } = useLocalSearchParams<{ id: string }>();
	const community = useCommunity(id);
	const update = useUpdateCommunity(id);
	const remove = useDeleteCommunity();
	const [inviting, setInviting] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace(`/communities/${id}`);
	}, [id]);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.column}
			>
				<ScreenHeader onBack={goBack} title="Community Settings" />

				{community.isPending ? (
					<StateMessage message="Loading community…" />
				) : community.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(community.error)}
						onPressAction={() => void community.refetch()}
					/>
				) : (
					<ScrollView
						contentContainerStyle={styles.content}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<CommunityForm
							error={update.isError ? describeError(update.error) : null}
							initial={{
								name: community.data.name,
								description: community.data.description,
								categoryId: community.data.category?.id ?? null,
								coverUrl: community.data.coverUrl,
								isPublic: community.data.isPublic,
							}}
							isSubmitting={update.isPending}
							members={[]}
							onAddMembers={() => setInviting(true)}
							onSubmit={(changes) => update.mutate(changes, { onSuccess: goBack })}
							submitLabel="Save"
						/>

						<SecondaryButton
							label="Delete Community"
							onPress={() => setConfirmDelete(true)}
							tone="danger"
						/>
					</ScrollView>
				)}
			</KeyboardAvoidingView>

			{community.data ? (
				<CommunityInviteSheet
					community={{ id: community.data.id, name: community.data.name }}
					onDismiss={() => setInviting(false)}
					visible={inviting}
				/>
			) : null}

			<ConfirmDialog
				cancelLabel="Keep It"
				confirmLabel="Delete"
				message="Every post, comment and membership goes with it. This can't be undone."
				onCancel={() => setConfirmDelete(false)}
				onConfirm={() => {
					setConfirmDelete(false);
					remove.mutate(id, { onSuccess: () => router.replace("/communities") });
				}}
				title="Delete this community?"
				visible={confirmDelete}
			/>
		</SafeAreaView>
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
});
