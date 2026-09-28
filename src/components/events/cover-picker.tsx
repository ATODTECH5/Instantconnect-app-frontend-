import { Image } from "expo-image";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import ImageAddIcon from "@/assets/events/image-add.svg";
import CameraIcon from "@/assets/profile/camera.svg";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";

const BOX_HEIGHT = 140;
const BADGE = 40;
const ICON = 22;
const PILL_ICON = 14;

export type CoverPickerProps = {
	/** Local uri of the picked photo, shown while and after it uploads. */
	uri: string | null;
	uploading: boolean;
	error: string | null;
	onPick: () => void;
};

export function CoverPicker({ uri, uploading, error, onPick }: CoverPickerProps) {
	return (
		<View style={styles.frame}>
			<Pressable
				accessibilityHint="Opens your photo library"
				accessibilityLabel={uri ? "Change cover photo" : "Add event cover photo"}
				accessibilityRole="button"
				accessibilityState={{ busy: uploading }}
				disabled={uploading}
				onPress={onPick}
				style={({ pressed }) => [
					styles.box,
					uri ? styles.filled : styles.empty,
					error ? styles.errorBorder : null,
					pressed && styles.pressed,
				]}
			>
				{uri ? (
					<>
						<Image
							accessibilityIgnoresInvertColors
							contentFit="cover"
							source={{ uri }}
							style={StyleSheet.absoluteFill}
						/>

						<View style={styles.pill}>
							{uploading ? (
								<ActivityIndicator color={Brand.purple} size="small" />
							) : (
								<CameraIcon
									color={Brand.purple}
									height={PILL_ICON}
									width={PILL_ICON}
								/>
							)}

							<Text style={styles.pillLabel}>
								{uploading ? "Uploading…" : "Change Image"}
							</Text>
						</View>
					</>
				) : (
					<>
						<View style={styles.badge}>
							<ImageAddIcon color={Brand.purple} height={ICON} width={ICON} />
						</View>

						<Text style={styles.title}>Add Event Cover Photo</Text>

						<Text style={styles.hint}>PNG or JPG, landscape works best (16:9)</Text>
					</>
				)}
			</Pressable>

			{error ? (
				<Text role="alert" style={styles.error}>
					{error}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	frame: {
		gap: Gap.tight,
	},
	box: {
		height: BOX_HEIGHT,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.one,
		overflow: "hidden",
		borderRadius: Radius.dialog,
	},
	empty: {
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: Brand.purpleLight,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	filled: {
		backgroundColor: Ink.fieldFill,
	},
	errorBorder: {
		borderColor: Ink.danger,
	},
	badge: {
		width: BADGE,
		height: BADGE,
		borderRadius: BADGE / 2,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.one,
		backgroundColor: Brand.purpleSurface,
	},
	title: {
		...Type.sectionLink,
		color: Brand.purple,
	},
	hint: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	pill: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.tight,
		paddingHorizontal: Gap.card,
		paddingVertical: Spacing.two,
		borderRadius: Radius.pill,
		backgroundColor: Ink.surfaceVeil,
	},
	pillLabel: {
		...Type.cardAction,
		color: Brand.purple,
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
	},
	pressed: {
		opacity: 0.85,
	},
});
