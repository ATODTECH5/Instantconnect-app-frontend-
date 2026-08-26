import { AbyssinicaSIL_400Regular } from "@expo-google-fonts/abyssinica-sil";
import {
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
	useFonts,
} from "@expo-google-fonts/inter";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { BrandSplash } from "@/components/brand-splash";
import { AuthSessionProvider } from "@/features/auth/auth-session";
import { SignUpDraftProvider } from "@/features/auth/sign-up-draft";
import { StartupGate } from "@/features/auth/startup-gate";
import { QueryProvider } from "@/lib/query/query-provider";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 200, fade: true });

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [fontsLoaded, fontError] = useFonts({
		AbyssinicaSIL_400Regular,
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
		Inter_700Bold,
	});
	const [isSplashVisible, setIsSplashVisible] = useState(true);
	const [hasDecided, setHasDecided] = useState(false);

	// A missing font must not strand the user on the native splash screen.
	const isReady = fontsLoaded || fontError !== null;

	useEffect(() => {
		if (isReady) SplashScreen.hideAsync();
	}, [isReady]);

	const handleDecided = useCallback(() => setHasDecided(true), []);
	const handleSplashFinish = useCallback(() => setIsSplashVisible(false), []);

	if (!isReady) return null;

	return (
		<QueryProvider>
			<AuthSessionProvider>
				<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<StatusBar style={isSplashVisible ? "light" : "auto"} />
					<StartupGate onDecided={handleDecided} />
					<SignUpDraftProvider>
						<Stack screenOptions={{ headerShown: false }}>
							<Stack.Screen name="(tabs)" />
							<Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
							<Stack.Screen name="get-started" options={{ gestureEnabled: false }} />
							<Stack.Screen name="sign-up" />
							<Stack.Screen name="sign-in" />
							<Stack.Screen name="terms" />
							<Stack.Screen name="verify-email" options={{ gestureEnabled: false }} />
							<Stack.Screen name="account-created" />
							<Stack.Screen name="create-pin" />
							<Stack.Screen name="interests" options={{ gestureEnabled: false }} />
							<Stack.Screen name="forgot-password" />
							<Stack.Screen name="reset-code" />
							<Stack.Screen name="new-password" options={{ gestureEnabled: false }} />
							<Stack.Screen
								name="password-changed"
								options={{ gestureEnabled: false }}
							/>
							<Stack.Screen name="location" options={{ gestureEnabled: false }} />
							<Stack.Screen name="search" />
						</Stack>
					</SignUpDraftProvider>
					{isSplashVisible && (
						<BrandSplash onFinish={handleSplashFinish} ready={hasDecided} />
					)}
				</ThemeProvider>
			</AuthSessionProvider>
		</QueryProvider>
	);
}
