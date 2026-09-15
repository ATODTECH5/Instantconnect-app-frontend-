import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlusIcon from "@/assets/profile/plus.svg";
import UsersIcon from "@/assets/home/cat-friendship.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { CircleRow } from "@/components/safety/circle-row";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { IconButton } from "@/components/ui/icon-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import { useCircleAction, useCircles } from "@/features/safety/use-safety";
import { describeError } from "@/lib/api/api-error";
import type { ApiCircle } from "@/lib/api/safety-schema";

const EDGE_INSET = Spacing.three;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Sheet = { kind: "circle" } | { kind: "member"; circle: ApiCircle } | null;

/**
 * Not in the design. The Safety Dispatch frame assumes circles such as
 * "Immediate Family" exist but nothing draws how they are made, so this
 * borrows that frame's row and the app's bottom sheet pattern for adding.
 * Members are outside contacts (name and email), not accounts.
 */
export default function CirclesScreen() {
	const circles = useCircles();
	const action = useCircleAction();
	const [sheet, setSheet] = useState<Sheet>(null);
	const [expanded, setExpanded] = useState<string | null>(null);
	const [deleting, setDeleting] = useState<ApiCircle | null>(null);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const goBack = useCallback(() => router.back(), []);

	const close = () => {
		setSheet(null);
		setName("");
		setEmail("");
	};

	const submit = () => {
		if (!sheet) return;

		if (sheet.kind === "circle") {
			if (!name.trim()) return;
			action.mutate({ type: "create", name: name.trim() }, { onSuccess: close });
			return;
		}

		if (!name.trim() || !EMAIL.test(email.trim())) return;

		action.mutate(
			{
				type: "addMember",
				circleId: sheet.circle.id,
				member: { name: name.trim(), email: email.trim() },
			},
			{ onSuccess: close },
		);
	};

	const canSubmit =
		sheet?.kind === "circle"
			? name.trim().length > 0
			: name.trim().length > 0 && EMAIL.test(email.trim());

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader
					onBack={goBack}
					title="Safety Circles"
					trailing={
						<IconButton
							Icon={PlusIcon}
							accessibilityLabel="New circle"
							onPress={() => setSheet({ kind: "circle" })}
						/>
					}
				/>

				{action.isError ? <FormErrorBanner message={describeError(action.error)} /> : null}

				{circles.isPending ? (
					<StateMessage message="Loading your circles…" />
				) : circles.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(circles.error)}
						onPressAction={() => void circles.refetch()}
					/>
				) : circles.data.length === 0 ? (
					<StateMessage
						actionLabel="Create a circle"
						message="Add the people who should know when you arrive somewhere safely. They get an email; they do not need the app."
						onPressAction={() => setSheet({ kind: "circle" })}
					/>
				) : (
					<FlatList
						contentContainerStyle={styles.list}
						data={circles.data}
						keyExtractor={(circle) => circle.id}
						renderItem={({ item }) => (
							<View style={styles.group}>
								<CircleRow
									accessibilityHint="Shows the people in this circle"
									name={item.name}
									onPress={() => setExpanded(expanded === item.id ? null : item.id)}
									subtitle={
										item.members.length === 0
											? "No one yet"
											: `${item.members.length} member${item.members.length === 1 ? "" : "s"}`
									}
								/>

								{expanded === item.id ? (
									<View style={styles.members}>
										{item.members.map((member) => (
											<View key={member.id} style={styles.member}>
												<View style={styles.memberText}>
													<Text style={styles.memberName}>{member.name}</Text>
													<Text style={styles.memberEmail}>{member.email}</Text>
												</View>
												<Pressable
													accessibilityLabel={`Remove ${member.name}`}
													accessibilityRole="button"
													accessibilityState={{ disabled: action.isPending }}
													disabled={action.isPending}
													hitSlop={12}
													onPress={() =>
														action.mutate({
															type: "removeMember",
															circleId: item.id,
															memberId: member.id,
														})
													}
												>
													<Text style={styles.remove}>Remove</Text>
												</Pressable>
											</View>
										))}

										<View style={styles.groupActions}>
											<Pressable
												accessibilityLabel={`Add a contact to ${item.name}`}
												accessibilityRole="button"
												onPress={() => setSheet({ kind: "member", circle: item })}
												style={({ pressed }) => [styles.link, pressed && styles.pressed]}
											>
												<PlusIcon color={Brand.purple} height={16} width={16} />
												<Text style={styles.linkLabel}>Add a contact</Text>
											</Pressable>
											<Pressable
												accessibilityLabel={`Delete ${item.name}`}
												accessibilityRole="button"
												onPress={() => setDeleting(item)}
												style={({ pressed }) => [styles.link, pressed && styles.pressed]}
											>
												<Text style={styles.linkDanger}>Delete circle</Text>
											</Pressable>
										</View>
									</View>
								) : null}
							</View>
						)}
					/>
				)}
			</View>

			<BottomSheet
				actions={
					<PrimaryButton
						disabled={!canSubmit || action.isPending}
						label={sheet?.kind === "circle" ? "Create circle" : "Add contact"}
						loading={action.isPending}
						onPress={submit}
					/>
				}
				badgeColor={Brand.purpleSurface}
				icon={<UsersIcon color={Brand.purple} height={22} width={22} />}
				message={
					sheet?.kind === "member"
						? `They will get an email when you arrive safely. They do not need the app.`
						: "A group of people who should hear when you arrive safely."
				}
				onDismiss={close}
				title={sheet?.kind === "member" ? `Add to ${sheet.circle.name}` : "New circle"}
				visible={sheet !== null}
			>
				<View style={styles.form}>
					<FormField
						autoFocus
						label={sheet?.kind === "member" ? "Name" : "Circle name"}
						maxLength={sheet?.kind === "member" ? 80 : 60}
						onChangeText={setName}
						onSubmitEditing={sheet?.kind === "circle" ? submit : undefined}
						placeholder={sheet?.kind === "member" ? "Mum" : "Immediate Family"}
						returnKeyType={sheet?.kind === "circle" ? "done" : "next"}
						value={name}
					/>
					{sheet?.kind === "member" ? (
						<FormField
							autoCapitalize="none"
							autoComplete="email"
							keyboardType="email-address"
							label="Email"
							maxLength={255}
							onChangeText={setEmail}
							onSubmitEditing={submit}
							placeholder="mum@example.com"
							returnKeyType="done"
							value={email}
						/>
					) : null}
				</View>
			</BottomSheet>

			<ConfirmDialog
				cancelLabel="Keep"
				confirmLabel="Delete"
				message={
					deleting
						? `${deleting.name} and its ${deleting.members.length} contact${deleting.members.length === 1 ? "" : "s"} will be removed. Meetups already told about it are unaffected.`
						: ""
				}
				onCancel={() => setDeleting(null)}
				onConfirm={() => {
					if (deleting) action.mutate({ type: "delete", id: deleting.id });
					setDeleting(null);
				}}
				title="Delete this circle?"
				visible={deleting !== null}
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
		paddingHorizontal: EDGE_INSET,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	list: {
		gap: Gap.card,
		paddingBottom: Spacing.five,
	},
	group: {
		gap: Spacing.two,
	},
	members: {
		paddingHorizontal: Spacing.three,
		gap: Spacing.two,
	},
	member: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		paddingVertical: Spacing.two,
	},
	memberText: {
		flex: 1,
	},
	memberName: {
		...Type.cardName,
		color: Ink.title,
	},
	memberEmail: {
		...Type.cardMeta,
		color: Ink.muted,
	},
	remove: {
		...Type.cardAction,
		color: Ink.danger,
	},
	groupActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	link: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
		paddingVertical: Spacing.two,
	},
	linkLabel: {
		...Type.cardAction,
		color: Brand.purple,
	},
	linkDanger: {
		...Type.cardAction,
		color: Ink.danger,
	},
	form: {
		alignSelf: "stretch",
		gap: Gap.card,
	},
	pressed: {
		opacity: 0.7,
	},
});
