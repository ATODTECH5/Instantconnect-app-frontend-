import { useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/components/nav/placeholder-screen";

export default function PersonScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<PlaceholderScreen
			description={`The full profile for ${id} opens here once profiles are built.`}
			title="Profile"
		/>
	);
}
