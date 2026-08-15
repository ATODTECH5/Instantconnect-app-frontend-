import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { Brand, Ink, Type } from "@/constants/theme";

export type AuthFooterNoteProps = {
	prompt: string;
	actionLabel: string;
	onPress: () => void;
	style?: StyleProp<TextStyle>;
};

/** The "Remember your password? Log in" line every auth screen closes with. */
export function AuthFooterNote({ prompt, actionLabel, onPress, style }: AuthFooterNoteProps) {
	return (
		<Text style={[styles.note, style]}>
			{prompt}{" "}
			<Text accessibilityRole="link" onPress={onPress} style={styles.link}>
				{actionLabel}
			</Text>
		</Text>
	);
}

const styles = StyleSheet.create({
	note: {
		...Type.footnote,
		color: Ink.muted,
		textAlign: "center",
	},
	link: {
		...Type.footnoteLink,
		color: Brand.purple,
	},
});
