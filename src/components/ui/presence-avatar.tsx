import { StyleSheet, View } from "react-native";

import { AvatarImage } from "@/components/ui/avatar-image";
import { Ink } from "@/constants/theme";

const DOT_RATIO = 0.325;
const RING_WIDTH = 2;

export type PresenceAvatarProps = {
	uri: string | null;
	fullName: string;
	size: number;
	isOnline?: boolean;
	accessibilityLabel?: string;
};

export function PresenceAvatar({
	uri,
	fullName,
	size,
	isOnline = false,
	accessibilityLabel,
}: PresenceAvatarProps) {
	const dotSize = Math.round(size * DOT_RATIO);

	return (
		<View style={{ width: size, height: size }}>
			<AvatarImage
				accessibilityLabel={accessibilityLabel}
				fullName={fullName}
				size={size}
				uri={uri}
			/>

			{isOnline ? (
				<View
					style={[
						styles.dot,
						{ width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
					]}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	dot: {
		position: "absolute",
		right: 0,
		bottom: 0,
		backgroundColor: Ink.online,
		borderWidth: RING_WIDTH,
		borderColor: Ink.surface,
	},
});
