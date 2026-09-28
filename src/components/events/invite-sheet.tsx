import { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import CheckIcon from "@/assets/auth/check.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PersonChip } from "@/components/ui/person-chip";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SearchField } from "@/components/ui/search-field";
import { StateMessage } from "@/components/ui/state-message";
import { TallSheet } from "@/components/ui/tall-sheet";
import { Brand, Gap, Ink, MinTapTarget, Spacing, Type } from "@/constants/theme";
import { useInvitableConnections } from "@/features/events/use-events";
import { describeError } from "@/lib/api/api-error";
import type { ApiConnection } from "@/lib/api/discovery-schema";

const AVATAR = 40;
const TICK = 24;
const TICK_ICON = 14;

export type Invitee = {
	id: string;
	fullName: string;
	avatarUrl: string | null;
};

export type InviteSheetProps = {
	visible: boolean;
	selected: Invitee[];
	onDone: (selected: Invitee[]) => void;
	onDismiss: () => void;
};

/**
 * Edits a draft, so backing out of the sheet leaves the form's list as it was.
 * Only accepted connections are offered, which is the same rule the server
 * enforces.
 */
export function InviteSheet({ visible, selected, onDone, onDismiss }: InviteSheetProps) {
	const connections = useInvitableConnections(visible);
	const [draft, setDraft] = useState<Invitee[]>(selected);
	const [query, setQuery] = useState("");
	const [wasVisible, setWasVisible] = useState(visible);

	// Reopening starts from what the form holds now, not the last draft.
	if (visible !== wasVisible) {
		setWasVisible(visible);
		if (visible) {
			setDraft(selected);
			setQuery("");
		}
	}

	const pickedIds = useMemo(() => new Set(draft.map((person) => person.id)), [draft]);

	const people = useMemo(() => {
		const needle = query.trim().toLowerCase();
		const all = connections.data?.items ?? [];

		return needle
			? all.filter((row) => row.party.fullName.toLowerCase().includes(needle))
			: all;
	}, [connections.data, query]);

	const toggle = useCallback((row: ApiConnection) => {
		setDraft((current) =>
			current.some((person) => person.id === row.party.id)
				? current.filter((person) => person.id !== row.party.id)
				: [
						...current,
						{
							id: row.party.id,
							fullName: row.party.fullName,
							avatarUrl: row.party.avatarUrl,
						},
					],
		);
	}, []);

	const remove = useCallback((id: string) => {
		setDraft((current) => current.filter((person) => person.id !== id));
	}, []);

	return (
		<TallSheet onDismiss={onDismiss} title="Invite people" visible={visible}>
			<View style={styles.body}>
				<SearchField
					accessibilityLabel="Search your connections by name"
					onChangeText={setQuery}
					onSubmit={() => undefined}
					placeholder="Search by name..."
					value={query}
				/>

				{draft.length > 0 ? (
					<View style={styles.section}>
						<Text accessibilityRole="header" style={styles.sectionTitle}>
							SELECTED
						</Text>

						<View style={styles.chips}>
							{draft.map((person) => (
								<PersonChip key={person.id} onRemove={remove} {...person} />
							))}
						</View>
					</View>
				) : null}

				<Text accessibilityRole="header" style={styles.sectionTitle}>
					FROM YOUR CONNECTIONS
				</Text>

				{connections.isPending ? (
					<StateMessage message="Loading your connections…" />
				) : connections.isError ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(connections.error)}
						onPressAction={() => void connections.refetch()}
					/>
				) : (
					<FlatList
						ListEmptyComponent={
							<StateMessage
								message={
									query.trim()
										? "No connections match that name."
										: "Connect with people first, then you can invite them to events."
								}
							/>
						}
						data={people}
						keyExtractor={(row) => row.id}
						keyboardShouldPersistTaps="handled"
						renderItem={({ item }) => (
							<ConnectionRow
								onToggle={toggle}
								row={item}
								selected={pickedIds.has(item.party.id)}
							/>
						)}
						style={styles.list}
					/>
				)}

				<PrimaryButton label="Done" onPress={() => onDone(draft)} />
			</View>
		</TallSheet>
	);
}

type ConnectionRowProps = {
	row: ApiConnection;
	selected: boolean;
	onToggle: (row: ApiConnection) => void;
};

const ConnectionRow = memo(function ConnectionRow({ row, selected, onToggle }: ConnectionRowProps) {
	const { party } = row;

	return (
		<Pressable
			accessibilityLabel={party.fullName}
			accessibilityRole="checkbox"
			accessibilityState={{ checked: selected }}
			onPress={() => onToggle(row)}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			<AvatarImage fullName={party.fullName} size={AVATAR} uri={party.avatarUrl} />

			<View style={styles.rowCopy}>
				<Text numberOfLines={1} style={styles.name}>
					{party.fullName}
				</Text>

				{party.locationLabel ? (
					<Text numberOfLines={1} style={styles.meta}>
						{party.locationLabel}
					</Text>
				) : null}
			</View>

			<View style={[styles.tick, selected && styles.tickOn]}>
				{selected ? (
					<CheckIcon color={Brand.onBrand} height={TICK_ICON} width={TICK_ICON} />
				) : null}
			</View>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	body: {
		flex: 1,
		gap: Gap.card,
		paddingBottom: Spacing.three,
	},
	section: {
		gap: Spacing.two,
	},
	sectionTitle: {
		...Type.overline,
		color: Ink.meta,
	},
	chips: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	list: {
		flex: 1,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget + Spacing.three,
		paddingVertical: Spacing.two,
	},
	rowCopy: {
		flex: 1,
		gap: Spacing.half,
	},
	name: {
		...Type.resultName,
		color: Ink.title,
	},
	meta: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	tick: {
		width: TICK,
		height: TICK,
		borderRadius: TICK / 2,
		borderWidth: 1,
		borderColor: Ink.border,
		alignItems: "center",
		justifyContent: "center",
	},
	tickOn: {
		borderColor: Brand.purple,
		backgroundColor: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
