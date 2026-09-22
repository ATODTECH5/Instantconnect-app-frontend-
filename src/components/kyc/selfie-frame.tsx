import { Image } from "expo-image";
import { StyleSheet, View, useWindowDimensions } from "react-native";

import CameraIcon from "@/assets/profile/camera.svg";
import { Brand, Ink } from "@/constants/theme";

const RING_WIDTH = 2;
const GUIDE_WIDTH = 1.5;
/** Fraction of the frame width the portrait takes, so it scales with the phone. */
const FRAME_RATIO = 0.62;
const MAX_SIZE = 260;
const ICON_RATIO = 0.22;

/** The purple ring with the paler guide oval inside it, holding the selfie once taken. */
export function SelfieFrame({ uri }: { uri: string | null }) {
	const { width } = useWindowDimensions();
	const size = Math.min(width * FRAME_RATIO, MAX_SIZE);
	const inner = size - RING_WIDTH * 2;
	const guide = inner * 0.78;

	return (
		<View
			accessibilityLabel={uri ? "Your selfie" : "No selfie yet"}
			accessibilityRole="image"
			style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
		>
			<View style={[styles.disc, { width: inner, height: inner, borderRadius: inner / 2 }]}>
				{uri ? (
					<Image
						contentFit="cover"
						source={{ uri }}
						style={{ width: inner, height: inner }}
						transition={150}
					/>
				) : (
					<CameraIcon color={Brand.purpleSoft} height={size * ICON_RATIO} width={size * ICON_RATIO} />
				)}

				<View
					pointerEvents="none"
					style={[
						styles.guide,
						{ width: guide, height: guide * 1.25, borderRadius: guide / 2 },
					]}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	ring: {
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: RING_WIDTH,
		borderColor: Brand.purple,
	},
	disc: {
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	guide: {
		position: "absolute",
		borderWidth: GUIDE_WIDTH,
		borderColor: Ink.surfaceVeil,
	},
});
