import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import CameraIcon from "@/assets/profile/camera.svg";
import { Brand, BrandGradient, Ink, Radius, Type } from "@/constants/theme";

const RING_WIDTH = 3;
const BADGE_SIZE = 32;
const BADGE_ICON = 18;

export type ProfileAvatarProps = {
	uri: string | null;
	/** Falls back to initials, so a profile without a photo still reads as a person. */
	fullName: string;
	size: number;
	onPressCamera?: () => void;
	isBusy?: boolean;
};

function initialsOf(fullName: string): string {
	const initials = fullName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

	return initials || "?";
}

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
			<View
				style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
			>
				{uri ? (
					<Image
						accessibilityIgnoresInvertColors
						contentFit="cover"
						source={{ uri }}
						style={{ width: inner, height: inner, borderRadius: inner / 2 }}
						transition={150}
					/>
				) : (
					<View
						style={[
							styles.fallback,
							{ width: inner, height: inner, borderRadius: inner / 2 },
						]}
					>
						<Text style={[styles.initials, { fontSize: inner * 0.34 }]}>
							{initialsOf(fullName)}
						</Text>
					</View>
				)}
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
	fallback: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	initials: {
		fontFamily: Type.profileName.fontFamily,
		color: Brand.purple,
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
