import { Pressable, StyleSheet, View } from "react-native";

import CameraIcon from "@/assets/profile/camera.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, BrandGradient, Ink, Radius } from "@/constants/theme";

const RING_WIDTH = 3;
const BADGE_SIZE = 32;
const BADGE_ICON = 18;

export type ProfileAvatarProps = {
	uri: string | null;
	fullName: string;
	size: number;
	onPressCamera?: () => void;
	isBusy?: boolean;
};

export function ProfileAvatar({
	uri,
	fullName,
	size,
	onPressCamera,
	isBusy = false,
}: ProfileAvatarProps) {
	const inner = size - RING_WIDTH * 2;

	return (
		<View style={{ width: size, height: size }}>
			<View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
				<AvatarImage fullName={fullName} size={inner} uri={uri} />
			</View>

			{onPressCamera ? (
				<Pressable
					accessibilityHint="Choose a new profile photo"
					accessibilityLabel="Change profile photo"
					accessibilityRole="button"
					accessibilityState={{ busy: isBusy, disabled: isBusy }}
					disabled={isBusy}
					hitSlop={12}
					onPress={onPressCamera}
					style={({ pressed }) => [styles.badge, pressed && styles.pressed]}
				>
					<CameraIcon color={Brand.purple} height={BADGE_ICON} width={BADGE_ICON} />
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	ring: {
		alignItems: "center",
		justifyContent: "center",
		...BrandGradient,
	},
	badge: {
		position: "absolute",
		right: 0,
		bottom: 4,
		width: BADGE_SIZE,
		height: BADGE_SIZE,
		borderRadius: Radius.pill,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surface,
		borderWidth: 1,
		borderColor: Ink.border,
	},
	pressed: {
		opacity: 0.7,
	},
});
