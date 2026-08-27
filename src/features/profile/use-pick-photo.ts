import {
	type ImagePickerOptions,
	launchImageLibraryAsync,
	requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { useCallback } from "react";
import { Alert, Linking } from "react-native";

/**
 * Square crop at the picker, so what the user framed is what the avatar shows.
 * Quality is trimmed here as well as at the server, which saves the upload
 * rather than only the stored file.
 */
const PICKER_OPTIONS: ImagePickerOptions = {
	mediaTypes: ["images"],
	allowsEditing: true,
	aspect: [1, 1],
	quality: 0.85,
};

export type PickedPhoto = {
	uri: string;
	/** Declared to the upload rather than assumed, since editing can yield PNG or HEIC. */
	mimeType: string;
	fileName: string;
};

export type PickPhoto = () => Promise<PickedPhoto | null>;

export function usePickPhoto(): PickPhoto {
	return useCallback(async () => {
		const permission = await requestMediaLibraryPermissionsAsync();

		if (!permission.granted) {
			// Once the OS stops offering the prompt only Settings can undo it, so
			// offering a retry that cannot work would be a dead end.
			if (permission.canAskAgain) return null;

			Alert.alert(
				"Photo access is off",
				"Turn on photo access in Settings to choose a profile photo.",
				[
					{ text: "Not now", style: "cancel" },
					{ text: "Open Settings", onPress: () => void Linking.openSettings() },
				],
			);

			return null;
		}

		const result = await launchImageLibraryAsync(PICKER_OPTIONS);

		if (result.canceled) return null;

		const asset = result.assets[0];

		if (!asset) return null;

		const mimeType = asset.mimeType ?? "image/jpeg";

		return {
			uri: asset.uri,
			mimeType,
			fileName: asset.fileName ?? `photo.${mimeType.split("/")[1] ?? "jpg"}`,
		};
	}, []);
}
