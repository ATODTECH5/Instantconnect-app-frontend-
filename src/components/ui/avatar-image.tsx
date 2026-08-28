import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { Brand, Type } from "@/constants/theme";

export type AvatarImageProps = {
	uri: string | null;
	/** Falls back to initials, so a person without a photo still reads as one. */
	fullName: string;
	size: number;
	accessibilityLabel?: string;
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

export function AvatarImage({ uri, fullName, size, accessibilityLabel }: AvatarImageProps) {
	const shape = { width: size, height: size, borderRadius: size / 2 };

	if (!uri) {
		return (
			<View
				accessible={accessibilityLabel !== undefined}
				accessibilityLabel={accessibilityLabel}
				style={[styles.fallback, shape]}
			>
				<Text style={[styles.initials, { fontSize: size * 0.34 }]}>
					{initialsOf(fullName)}
				</Text>
			</View>
		);
	}

	return (
		<Image
			accessibilityIgnoresInvertColors
			accessible={accessibilityLabel !== undefined}
			alt={accessibilityLabel}
			contentFit="cover"
			source={{ uri }}
			style={shape}
			transition={150}
		/>
	);
}

const styles = StyleSheet.create({
	fallback: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	initials: {
		fontFamily: Type.profileName.fontFamily,
		color: Brand.purple,
	},
});
