import { StyleSheet, Text, View } from "react-native";

import { Ink, Radius, Spacing, Type } from "@/constants/theme";

export type ProfileStatsProps = {
	connections: number;
	eventsJoined: number;
	communities: number;
};

export function ProfileStats({ connections, eventsJoined, communities }: ProfileStatsProps) {
	return (
		<View style={styles.card}>
			<Stat label="Connections" value={connections} />

			<View style={styles.divider} />

			<Stat label="Events Joined" value={eventsJoined} />

			<View style={styles.divider} />

			<Stat label="Communities" value={communities} />
		</View>
	);
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<View accessibilityLabel={`${value} ${label}`} style={styles.stat}>
			<Text style={styles.value}>{value}</Text>

			<Text numberOfLines={1} style={styles.label}>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: Spacing.three,
		borderRadius: Radius.media,
		backgroundColor: Ink.keypad,
	},
	stat: {
		flex: 1,
		alignItems: "center",
		gap: Spacing.half,
		paddingHorizontal: Spacing.one,
	},
	divider: {
		width: 1,
		alignSelf: "stretch",
		backgroundColor: Ink.border,
	},
	value: {
		...Type.statValue,
		color: Ink.title,
	},
	label: {
		...Type.statLabel,
		color: Ink.meta,
	},
});
