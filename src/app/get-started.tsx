import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";

import { GetStartedPanel } from "@/components/onboarding/get-started-panel";
import { markOnboardingSeen } from "@/lib/api/onboarding-storage";

export default function GetStartedScreen() {
	const handleStart = useCallback(() => {
		void markOnboardingSeen();
		router.push("/sign-up");
	}, []);

	return (
		<>
			<StatusBar style="light" />
			<GetStartedPanel onStart={handleStart} />
		</>
	);
}
