import { Stack } from "expo-router";

import { SearchHistoryProvider } from "@/features/search/search-history";

export default function SearchLayout() {
	return (
		<SearchHistoryProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="filters" options={{ presentation: "card" }} />
			</Stack>
		</SearchHistoryProvider>
	);
}
