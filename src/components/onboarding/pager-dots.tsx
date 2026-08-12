import { StyleSheet, View } from "react-native";

import { Brand } from "@/constants/theme";

type PagerDotsProps = {
	count: number;
	activeIndex: number;
};

export function PagerDots({ count, activeIndex }: PagerDotsProps) {
	return (
		<View
			style={styles.track}
			accessibilityRole="progressbar"
			accessibilityValue={{ min: 1, max: count, now: activeIndex + 1 }}
		>
			{Array.from({ length: count }, (_, index) => (
				<View key={index} style={index === activeIndex ? styles.active : styles.dot} />
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	track: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
		paddingHorizontal: 4,
		paddingVertical: 2,
		borderRadius: 5,
		backgroundColor: Brand.purpleSurfaceSubtle,
		alignSelf: "center",
	},
	active: {
		width: 30,
		height: 6,
		borderRadius: 3,
		backgroundColor: Brand.purple,
	},
	dot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: Brand.purpleSurface,
	},
});
