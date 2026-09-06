import { Stack } from "expo-router";

export default function ConnectionsLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="safety" />
			<Stack.Screen name="places" />
			<Stack.Screen name="events" />
		</Stack>
	);
}
