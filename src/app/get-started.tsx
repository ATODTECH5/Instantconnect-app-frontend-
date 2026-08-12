import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";

import { GetStartedPanel } from "@/components/onboarding/get-started-panel";

export default function GetStartedScreen() {
	const handleStart = useCallback(() => router.replace("/(tabs)"), []);

	return (
		<>
			<StatusBar style="light" />
			<GetStartedPanel onStart={handleStart} />
		</>
	);
}
