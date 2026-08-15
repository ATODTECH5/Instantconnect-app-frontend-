import { StyleSheet, Text, View } from "react-native";

import { Brand, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { ResolvedAddress } from "@/features/location/geocoding";

export type LocationCardProps = {
	address: ResolvedAddress | null;
	/** True while the address for the current pin is still being looked up. */
	loading: boolean;
	/** Shown when the lookup failed, in place of the address lines. */
	error?: string | null;
};

export function LocationCard({ address, loading, error }: LocationCardProps) {
	return (
		<View style={styles.card}>
			<View style={styles.hintRow}>
				<Text style={styles.hint}>Drag the pin to your preferred location</Text>
			</View>

			<View style={styles.body}>
				<Text numberOfLines={2} style={styles.line}>
					{loading ? "Finding this place…" : (error ?? address?.line ?? "Dropped pin")}
				</Text>

				{!loading && !error && address?.context ? (
					<Text numberOfLines={1} style={styles.context}>
						{address.context}
					</Text>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: Radius.control,
		backgroundColor: Ink.surface,
		overflow: "hidden",
	},
	hintRow: {
		alignItems: "center",
		paddingVertical: Spacing.two,
		paddingHorizontal: Spacing.three,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	hint: {
		...Type.footnote,
		color: Brand.purple,
		textAlign: "center",
	},
	body: {
		gap: Spacing.one,
		paddingVertical: Spacing.two + Spacing.half,
		paddingHorizontal: Spacing.three,
	},
	line: {
		...Type.optionLabel,
		color: Ink.title,
	},
	context: {
		...Type.footnote,
		color: Ink.placeholder,
	},
});
