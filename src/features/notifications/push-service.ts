import Constants from "expo-constants";
import { isDevice } from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { Brand } from "@/constants/theme";
import { request } from "@/lib/api/api-client";

/** Must match `ANDROID_CHANNEL_ID` on the server, or Android drops the push. */
const ANDROID_CHANNEL_ID = "default";

/**
 * The token this install registered for the account signed in now, kept so
 * sign out can unregister exactly it. In memory only: a cold start registers
 * again, and registering is idempotent on the server.
 */
let registeredToken: string | null = null;

/**
 * The route on screen, so a push about the conversation already open does not
 * drop a banner over the message it is announcing. Written by the hook that
 * mounts the push wiring; read by the handler below, which lives outside React.
 */
let currentPath: string | null = null;

export function setCurrentPath(path: string): void {
	currentPath = path;
}

/**
 * While the app is open, a push still shows as a banner, because the bell is
 * the only other sign and it is only on Home. The one exception is a message
 * for the thread on screen, which the thread itself is already showing.
 */
Notifications.setNotificationHandler({
	handleNotification: async (notification) => {
		const data = notification.request.content.data as PushData | undefined;
		const isOpenThread =
			data?.kind === "message" &&
			typeof data.subjectId === "string" &&
			currentPath === `/chat/${data.subjectId}`;

		return {
			shouldShowBanner: !isOpenThread,
			shouldShowList: !isOpenThread,
			shouldPlaySound: !isOpenThread,
			shouldSetBadge: true,
		};
	},
});

/** What the server puts in every push's data, mirroring a row on the Notifications screen. */
export type PushData = {
	notificationId?: string;
	kind?: string;
	subjectId?: string | null;
};

/**
 * Asks once, registers whatever the answer allows, and never throws: push is
 * an extra on top of the in-app bell, so a refusal or a failure here must not
 * stand between someone and the app.
 *
 * The Simulator still asks for permission, so the prompt and a pushed payload
 * from `xcrun simctl push` can be tried there, but it stops short of the
 * token: Expo will not issue one to a Simulator.
 */
export async function registerForPush(): Promise<void> {
	try {
		if (Platform.OS === "android") {
			// The channel has to exist before the permission prompt on Android 13+,
			// which is what makes the system show the prompt at all.
			await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
				name: "Notifications",
				importance: Notifications.AndroidImportance.HIGH,
				lightColor: Brand.pink,
			});
		}

		let { status } = await Notifications.getPermissionsAsync();

		if (status !== "granted") {
			({ status } = await Notifications.requestPermissionsAsync());
		}

		if (status !== "granted" || !isDevice) return;

		const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
		const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

		await request("/notifications/push-token", {
			method: "PUT",
			body: { token, platform: Platform.OS === "ios" ? "ios" : "android" },
			auth: true,
		});

		registeredToken = token;
	} catch {
		// Not surfaced: the bell still works without push, and registration is
		// retried on the next launch.
	}
}

/**
 * Called on sign out, before the session is dropped, since the server only
 * lets an account remove its own tokens. If it cannot reach the server, the
 * next account to sign in on this install takes the token over anyway.
 */
export async function unregisterForPush(): Promise<void> {
	const token = registeredToken;

	registeredToken = null;
	void Notifications.setBadgeCountAsync(0).catch(() => undefined);

	if (!token) return;

	try {
		await request("/notifications/push-token", {
			method: "DELETE",
			body: { token },
			auth: true,
		});
	} catch {
		// Deliberately quiet, for the same reason sign out ignores a failed revoke.
	}
}
