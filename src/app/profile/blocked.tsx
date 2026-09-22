import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ShieldIcon from "@/assets/settings/shield.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { InfoNotice } from "@/components/settings/info-notice";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SearchField } from "@/components/ui/search-field";
import { SecondaryButton } from "@/components/ui/secondary-button";
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
import { useBlockAction, useBlockedUsers } from "@/features/blocks/use-blocks";
import { describeError } from "@/lib/api/api-error";
import type { ApiBlockedUser } from "@/lib/api/blocks-schema";
import { formatDate } from "@/utils/format";

const EDGE_INSET = Spacing.three;
const AVATAR_SIZE = 44;
const SHEET_AVATAR_SIZE = 56;


/**
 * Blocked Users (Figma 2811:639) with the unblock sheet (2813:1008) and the
 * saved banner (2813:1304). The search box filters the loaded list by name;
 * blocked lists are short, so there is no server search.
 */
export default function BlockedUsersScreen() {
	const blocked = useBlockedUsers();
	const action = useBlockAction();
	const [query, setQuery] = useState("");
	const [pending, setPending] = useState<ApiBlockedUser | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const goBack = useCallback(() => router.back(), []);

	const items = useMemo(() => {
		const needle = query.trim().toLowerCase();
		const all = blocked.data ?? [];

		return needle ? all.filter((user) => user.fullName.toLowerCase().includes(needle)) : all;
	}, [blocked.data, query]);

	const unblock = () => {
		if (!pending) return;

		const target = pending;
		setPending(null);
		setError(null);

		action.mutate(
			{ type: "unblock", userId: target.id },
			{
				onSuccess: () => setNotice("Your changes has been saved"),
				onError: (cause) => setError(describeError(cause)),
			},
		);
	};

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Blocked Users" />

				{notice ? <Toast message={notice} onDismiss={() => setNotice(null)} /> : null}
				{error ? (
					<Toast message={error} onDismiss={() => setError(null)} tone="error" />
				) : null}

				{notice ? null : (
					<SearchField
						accessibilityLabel="Search blocked users"
						onChangeText={setQuery}
						onSubmit={() => {}}
						placeholder="Search..."
						value={query}
					/>
				)}

				<InfoNotice
					Icon={ShieldIcon}
					message="Blocked accounts will not be able to contact you, view your profile, or join mutual community groups."
				/>

				{blocked.isPending ? (
					<StateMessage message="Loading your blocked list…" />
				) : blocked.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(blocked.error)}
						onPressAction={() => void blocked.refetch()}
					/>
				) : items.length === 0 ? (
					<StateMessage
						message={
							query.trim()
								? "No blocked users match that name."
								: "You have not blocked anyone. People you block appear here, and you can unblock them at any time."
						}
					/>
				) : (
					<FlatList
						ListFooterComponent={
							<Text style={styles.count}>
								Showing {items.length} blocked user{items.length === 1 ? "" : "s"}
							</Text>
						}
						contentContainerStyle={styles.list}
						data={items}
						keyExtractor={(user) => user.id}
						keyboardShouldPersistTaps="handled"
						renderItem={({ item }) => (
							<View style={styles.row}>
								<ProfileAvatar
									fullName={item.fullName}
									size={AVATAR_SIZE}
									uri={item.avatarUrl}
								/>

								<View style={styles.rowText}>
									<Text numberOfLines={1} style={styles.name}>
										{item.fullName}
									</Text>

									<Text style={styles.meta}>
										Blocked on {formatDate(item.blockedAt)}
									</Text>
								</View>

								<Pressable
									accessibilityLabel={`Unblock ${item.fullName}`}
									accessibilityRole="button"
									onPress={() => setPending(item)}
									style={({ pressed }) => [
										styles.unblock,
										pressed && styles.pressed,
									]}
								>
									<Text style={styles.unblockLabel}>Unblock</Text>
								</Pressable>
							</View>
						)}
					/>
				)}
			</View>

			<BottomSheet
				actions={
					<>
						<PrimaryButton label="Unblock User" onPress={unblock} />

						<SecondaryButton label="Cancel" onPress={() => setPending(null)} />
					</>
				}
				badgeColor="transparent"
				icon={
					pending ? (
						<ProfileAvatar
							fullName={pending.fullName}
							size={SHEET_AVATAR_SIZE}
							uri={pending.avatarUrl}
						/>
					) : null
				}
				message="They will be able to see your profile, send you messages, and request community transactions again."
				onDismiss={() => setPending(null)}
				title={pending ? `Unblock ${pending.fullName.split(" ")[0]}?` : ""}
				visible={pending !== null}
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
		paddingBottom: Spacing.five,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		paddingVertical: Gap.card,
		borderBottomWidth: 1,
		borderBottomColor: Ink.bubbleIncoming,
	},
	rowText: {
		flex: 1,
		gap: Spacing.one,
	},
	name: {
		...Type.resultName,
		color: Ink.title,
	},
	meta: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	unblock: {
		minHeight: MinTapTarget - Spacing.three,
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.one,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purple,
	},
	unblockLabel: {
		...Type.cardAction,
		color: Brand.onBrand,
	},
	count: {
		...Type.resultMeta,
		color: Ink.meta,
		textAlign: "center",
		paddingTop: Spacing.four,
	},
	pressed: {
		opacity: 0.7,
	},
});
