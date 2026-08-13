import type { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import AppleIcon from "@/assets/auth/apple.svg";
import FacebookIcon from "@/assets/auth/facebook.svg";
import GoogleIcon from "@/assets/auth/google.svg";
import { MinTapTarget, Spacing } from "@/constants/theme";

const ICON_SIZE = 28;

export type SocialProvider = "facebook" | "google" | "apple";

const PROVIDERS: { key: SocialProvider; Icon: FC<SvgProps>; label: string }[] = [
	{ key: "facebook", Icon: FacebookIcon, label: "Facebook" },
	{ key: "google", Icon: GoogleIcon, label: "Google" },
	{ key: "apple", Icon: AppleIcon, label: "Apple" },
];

export type SocialAuthRowProps = {
	onSelect: (provider: SocialProvider) => void;
	/** Completes the "Continue with ..." accessibility label. */
	action: string;
};

export function SocialAuthRow({ onSelect, action }: SocialAuthRowProps) {
	return (
		<View style={styles.row}>
			{PROVIDERS.map(({ key, Icon, label }) => (
				<Pressable
					accessibilityLabel={`${action} with ${label}`}
					accessibilityRole="button"
					key={key}
					onPress={() => onSelect(key)}
					style={({ pressed }) => [styles.target, pressed && styles.pressed]}
				>
					<Icon height={ICON_SIZE} width={ICON_SIZE} />
				</Pressable>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "center",
		gap: Spacing.three - Spacing.one,
	},
	target: {
		width: MinTapTarget,
		height: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
	},
	pressed: {
		opacity: 0.6,
	},
});
