import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { AvatarImage } from "@/components/ui/avatar-image";
import { Gap, Ink, Spacing, Type } from "@/constants/theme";

const AVATAR = 52;
const ITEM_WIDTH = 56;

export type StoryRailPerson = {
	id: string;
	fullName: string;
	avatarUrl: string | null;
};

export type StoryRailProps = {
	people: StoryRailPerson[];
	edgeInset: number;
	onOpen: (id: string) => void;
};

/** The row of accepted connections across the top of the Connection tab. */
export const StoryRail = memo(function StoryRail({
	people,
	edgeInset,
	onOpen,
}: StoryRailProps) {
	return (
		<ScrollView
			accessibilityLabel="Your connections"
			contentContainerStyle={[styles.content, { paddingHorizontal: edgeInset }]}
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.rail}
		>
			{people.map((person) => (
				<Pressable
					accessibilityHint="Opens this profile"
					accessibilityLabel={person.fullName}
					accessibilityRole="button"
					key={person.id}
					onPress={() => onOpen(person.id)}
					style={({ pressed }) => [styles.item, pressed && styles.pressed]}
				>
					<AvatarImage fullName={person.fullName} size={AVATAR} uri={person.avatarUrl} />

					<Text numberOfLines={1} style={styles.name}>
						{person.fullName}
					</Text>
				</Pressable>
			))}
		</ScrollView>
	);
});

const styles = StyleSheet.create({
	/**
	 * A horizontal ScrollView nested in a vertical one stretches to fill the
	 * parent unless its own growth is pinned, which leaves a tall dead gap
	 * under the rail.
	 */
	rail: {
		flexGrow: 0,
	},
	content: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Gap.section,
	},
	item: {
		width: ITEM_WIDTH,
		alignItems: "center",
		gap: Spacing.one,
	},
	name: {
		...Type.categoryLabel,
		color: Ink.title,
		textAlign: "center",
	},
	pressed: {
		opacity: 0.7,
	},
});
