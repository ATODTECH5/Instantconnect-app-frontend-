import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommunityForm, type FormPerson } from "@/components/communities/community-form";
import { InviteSheet } from "@/components/events/invite-sheet";
import { ScreenHeader } from "@/components/nav/screen-header";
import { Gap, Ink, MaxColumnWidth, Spacing } from "@/constants/theme";
import { useCreateCommunity } from "@/features/communities/use-communities";
import { describeError } from "@/lib/api/api-error";

export default function NewCommunityScreen() {
	const create = useCreateCommunity();
	const [invitees, setInvitees] = useState<FormPerson[]>([]);
	const [picking, setPicking] = useState(false);

	const goBack = useCallback(() => {
		if (router.canGoBack()) router.back();
		else router.replace("/communities");
	}, []);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.column}
			>
				<ScreenHeader onBack={goBack} title="Create Community" />

				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<CommunityForm
						error={create.isError ? describeError(create.error) : null}
						isSubmitting={create.isPending}
						members={invitees}
						onAddMembers={() => setPicking(true)}
						onRemoveMember={(id) =>
							setInvitees((current) => current.filter((person) => person.id !== id))
						}
						onSubmit={(draft) =>
							create.mutate(
								{ ...draft, inviteeIds: invitees.map((person) => person.id) },
								{
									onSuccess: (community) =>
										router.replace({
											pathname: "/communities/created",
											params: { id: community.id },
										}),
								},
							)
						}
						submitLabel="Create Community"
					/>
				</ScrollView>
			</KeyboardAvoidingView>

			<InviteSheet
				onDismiss={() => setPicking(false)}
				onDone={(picked) => {
					setInvitees(picked);
					setPicking(false);
				}}
				selected={invitees}
				visible={picking}
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
		paddingBottom: Spacing.five,
	},
});
