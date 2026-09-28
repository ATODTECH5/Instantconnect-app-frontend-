import { StyleSheet, Text, View } from "react-native";

import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, Ink, Type } from "@/constants/theme";

const SIZE = 28;
const RING = 2;
const OVERLAP = 10;

export type StackPerson = {
	id: string;
	fullName: string;
	avatarUrl: string | null;
};

export type AvatarStackProps = {
	people: StackPerson[];
	extraCount?: number;
	accessibilityLabel: string;
};

/** Overlapping faces, photo or initials, closed by a "+N" disc. */
export function AvatarStack({ people, extraCount = 0, accessibilityLabel }: AvatarStackProps) {
	return (
		<View accessibilityLabel={accessibilityLabel} style={styles.row}>
			{people.map((person, index) => (
				<View key={person.id} style={[styles.ring, index > 0 && styles.overlap]}>
					<AvatarImage
						fullName={person.fullName}
						size={SIZE - RING * 2}
						uri={person.avatarUrl}
					/>
				</View>
			))}

			{extraCount > 0 ? (
				<View style={[styles.ring, styles.extra, people.length > 0 && styles.overlap]}>
					<Text style={styles.extraLabel}>+{extraCount}</Text>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	ring: {
		width: SIZE,
		height: SIZE,
		borderRadius: SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surface,
	},
	overlap: {
		marginLeft: -OVERLAP,
	},
	extra: {
		borderWidth: RING,
		borderColor: Ink.surface,
		backgroundColor: Brand.purple,
	},
	extraLabel: {
		...Type.badgeLabel,
		color: Brand.onBrand,
	},
});
