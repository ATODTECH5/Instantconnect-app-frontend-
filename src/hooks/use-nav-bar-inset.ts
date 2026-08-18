import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NavBarHeight } from "@/constants/theme";

export function useNavBarInset() {
	const insets = useSafeAreaInsets();

	return NavBarHeight + insets.bottom;
}
