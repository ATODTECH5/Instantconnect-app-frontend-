import { isDevice } from "expo-device";
import {
	CameraType,
	type ImagePickerOptions,
	launchCameraAsync,
	requestCameraPermissionsAsync,
} from "expo-image-picker";
import { useCallback } from "react";
import { Alert, Linking } from "react-native";

import { type PickedPhoto, usePickPhoto } from "@/features/profile/use-pick-photo";

/** Front camera, square, so the face sits in the guide oval. */
const SELFIE_OPTIONS: ImagePickerOptions = {
	mediaTypes: ["images"],
	cameraType: CameraType.front,
	allowsEditing: true,
	aspect: [1, 1],
	quality: 0.85,
};

/**
 * A live capture is the point of the step, so the camera is used on a
 * device. The simulator has none, and UIImagePickerController throws an
 * Objective-C exception on `setSourceType:` that no JS catch can reach (it
 * killed the app on 22 Sep), so it is never asked there; the library is the
 * only way to walk the flow on the simulator.
 */
export function useTakeSelfie(): () => Promise<PickedPhoto | null> {
	const pickFromLibrary = usePickPhoto(SELFIE_OPTIONS);

	return useCallback(async () => {
		if (!isDevice) return pickFromLibrary();

		const permission = await requestCameraPermissionsAsync();

		if (!permission.granted) {
			if (permission.canAskAgain) return null;

			Alert.alert(
				"Camera access is off",
				"Turn on camera access in Settings to take your selfie.",
				[
					{ text: "Not now", style: "cancel" },
					{ text: "Open Settings", onPress: () => void Linking.openSettings() },
				],
			);

			return null;
		}

		const result = await launchCameraAsync(SELFIE_OPTIONS);

		if (result.canceled) return null;

		const asset = result.assets[0];

		if (!asset) return null;

		const mimeType = asset.mimeType ?? "image/jpeg";

		return {
			uri: asset.uri,
			mimeType,
			fileName: asset.fileName ?? `selfie.${mimeType.split("/")[1] ?? "jpg"}`,
		};
	}, [pickFromLibrary]);
}
