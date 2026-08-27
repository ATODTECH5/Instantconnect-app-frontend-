import { Image } from "expo-image";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import PlusIcon from "@/assets/profile/plus.svg";
import TrashIcon from "@/assets/profile/trash.svg";
import { AbsoluteFill, Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { ApiProfilePhoto } from "@/lib/api/profile-schema";

const GALLERY_POSITIONS = [1, 2, 3] as const;
const ICON_SIZE = 20;

export type PhotoGalleryProps = {
	photos: ApiProfilePhoto[];
	onAdd: (position: number) => void;
	onRemove: (position: number) => void;
	busyPosition: number | null;
};

/**
 * Three fixed slots rather than a growing list, matching the artboard: a filled
 * slot offers removal, an empty one offers a photo.
 */
export function PhotoGallery({ photos, onAdd, onRemove, busyPosition }: PhotoGalleryProps) {
	const byPosition = new Map(photos.map((photo) => [photo.position, photo]));

	return (
		<View style={styles.row}>
			{GALLERY_POSITIONS.map((position) => {
				const photo = byPosition.get(position);
				const isBusy = busyPosition === position;

				return (
					<Pressable
						accessibilityHint={
							photo ? "Removes this photo" : "Choose a photo for this slot"
						}
						accessibilityLabel={
							photo ? `Photo ${position}, filled` : `Photo ${position}, empty`
						}
						accessibilityRole="button"
						accessibilityState={{ busy: isBusy, disabled: isBusy }}
						disabled={isBusy}
						key={position}
						onPress={() => (photo ? onRemove(position) : onAdd(position))}
						style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
					>
						{photo ? (
							<Image
								accessibilityIgnoresInvertColors
								contentFit="cover"
								source={{ uri: photo.thumbnailUrl }}
								style={styles.image}
								transition={150}
							/>
						) : null}

						{isBusy ? (
							<View style={styles.overlay}>
								<ActivityIndicator color={Brand.purple} />
							</View>
						) : (
							<View style={[styles.action, photo && styles.actionOnPhoto]}>
								{photo ? (
									<TrashIcon
										color={Ink.surface}
										height={ICON_SIZE}
										width={ICON_SIZE}
									/>
								) : (
									<PlusIcon
										color={Brand.purple}
										height={ICON_SIZE}
										width={ICON_SIZE}
									/>
								)}
							</View>
						)}
					</Pressable>
				);
			})}
		</View>
	);
}

export function PhotoGalleryHint() {
	return <Text style={styles.hint}>Add up to three more photos for your profile.</Text>;
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		gap: Gap.snug,
	},
	slot: {
		flex: 1,
		aspectRatio: 1,
		borderRadius: Radius.control,
		overflow: "hidden",
		backgroundColor: Ink.keypad,
		alignItems: "center",
		justifyContent: "center",
	},
	image: {
		...AbsoluteFill,
	},
	overlay: {
		...AbsoluteFill,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surfaceVeil,
	},
	action: {
		alignItems: "center",
		justifyContent: "center",
		width: 34,
		height: 34,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSurface,
	},
	actionOnPhoto: {
		backgroundColor: Ink.mediaScrim,
	},
	pressed: {
		opacity: 0.7,
	},
	hint: {
		...Type.footnote,
		marginTop: Spacing.two,
		color: Ink.meta,
	},
});
