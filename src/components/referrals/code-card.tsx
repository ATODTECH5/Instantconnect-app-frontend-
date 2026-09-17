import { Pressable, StyleSheet, Text, View } from "react-native";

import CopyIcon from "@/assets/referrals/copy.svg";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const ICON = 16;

export type CodeCardProps = {
	code: string;
	onCopy: () => void;
};

/** "YOUR PERSONAL CODE" with the Copy control (Figma 3051:1443). */
export function CodeCard({ code, onCopy }: CodeCardProps) {
	return (
		<View style={styles.card}>
			<Text style={styles.heading}>Your personal code</Text>

			<View style={styles.row}>
				<View accessibilityLabel={`Your referral code is ${code}`} style={styles.codeBox}>
					<Text numberOfLines={1} selectable style={styles.code}>
						{code}
					</Text>
				</View>

				<Pressable
					accessibilityHint="Copies the code to the clipboard"
					accessibilityLabel="Copy code"
					accessibilityRole="button"
					onPress={onCopy}
					style={({ pressed }) => [styles.copy, pressed && styles.pressed]}
				>
					<CopyIcon color={Brand.onBrand} height={ICON} width={ICON} />
					<Text style={styles.copyLabel}>Copy</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Gap.card,
		padding: Spacing.three,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.dialog,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	heading: {
		...Type.fieldLabel,
		color: Ink.meta,
		textTransform: "uppercase",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
	},
	codeBox: {
		flex: 1,
		minHeight: MinTapTarget - Spacing.two,
		justifyContent: "center",
		paddingHorizontal: Gap.card,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.control,
		backgroundColor: Ink.surface,
	},
	code: {
		...Type.docSection,
		color: Brand.purple,
	},
	copy: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.tight,
		minHeight: MinTapTarget - Spacing.two,
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.control,
		backgroundColor: Brand.purple,
	},
	copyLabel: {
		...Type.docSection,
		color: Brand.onBrand,
	},
	pressed: {
		opacity: 0.8,
	},
});
