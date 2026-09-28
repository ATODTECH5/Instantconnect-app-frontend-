import { StyleSheet, Text, View } from "react-native";

import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, Gap, Ink, Spacing, Type } from "@/constants/theme";
import type { ApiEventPerson } from "@/lib/api/event-schema";

const FACE = 40;
const EXTRA = 25;
/** Faces the row shows before the rest collapse into "+N". */
const MAX_FACES = 6;

export type PeopleFacesProps = {
	people: ApiEventPerson[];
	/** Everyone in the group, which can exceed the people the server sent. */
	total: number;
	/** "going", "invited": read out with the "+N" disc. */
	noun: string;
};

/** A wrapping row of faces with first names, closed by a "+N" disc. */
export function PeopleFaces({ people, total, noun }: PeopleFacesProps) {
	const faces = people.slice(0, MAX_FACES);
	const extra = total - faces.length;

	return (
		<View style={styles.faces}>
			{faces.map((person) => (
				<View key={person.id} style={styles.face}>
					<AvatarImage fullName={person.fullName} size={FACE} uri={person.avatarUrl} />

					<Text numberOfLines={1} style={styles.faceName}>
						{person.fullName.split(" ")[0]}
					</Text>
				</View>
			))}

			{extra > 0 ? (
				<View accessibilityLabel={`${extra} more ${noun}`} style={styles.extra}>
					<Text style={styles.extraLabel}>+{extra}</Text>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	faces: {
		flexDirection: "row",
		alignItems: "flex-start",
		flexWrap: "wrap",
		gap: Gap.snug,
	},
	face: {
		alignItems: "center",
		gap: Spacing.half,
		width: FACE + Spacing.two,
	},
	faceName: {
		...Type.categoryLabel,
		color: Ink.muted,
	},
	extra: {
		width: EXTRA,
		height: EXTRA,
		borderRadius: EXTRA / 2,
		alignItems: "center",
		justifyContent: "center",
		marginTop: (FACE - EXTRA) / 2,
		backgroundColor: Brand.purple,
	},
	extraLabel: {
		...Type.badgeLabel,
		color: Brand.onBrand,
	},
});
