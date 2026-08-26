import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { BrandGradientStops, Ink } from "@/constants/theme";

const HALO_SIZE = 100;
const DISC_SIZE = 72;
const CHECK_SIZE = 72;

/** Check endpoints from the artboard, in disc local coordinates. */
const CHECK_PATH = "M48 27L31.5 43.5L24 36";
const CHECK_AXIS = { x1: 71, y1: 44, x2: 39, y2: 6.5 } as const;

export function SuccessBadge() {
	return (
		<View
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			style={styles.halo}
		>
			<View style={styles.disc}>
				<Svg height={CHECK_SIZE} width={CHECK_SIZE}>
					<Defs>
						<LinearGradient
							gradientUnits="userSpaceOnUse"
							id="successCheck"
							x1={CHECK_AXIS.x1}
							y1={CHECK_AXIS.y1}
							x2={CHECK_AXIS.x2}
							y2={CHECK_AXIS.y2}
						>
							{BrandGradientStops.map(({ offset, color }) => (
								<Stop key={color} offset={offset} stopColor={color} />
							))}
						</LinearGradient>
					</Defs>

					<Path
						d={CHECK_PATH}
						fill="none"
						stroke="url(#successCheck)"
						strokeLinecap="round"
						strokeWidth="4"
					/>
				</Svg>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	halo: {
		width: HALO_SIZE,
		height: HALO_SIZE,
		borderRadius: HALO_SIZE / 2,
		backgroundColor: "rgba(255, 255, 255, 0.149)",
		borderWidth: 2,
		borderColor: "rgba(255, 255, 255, 0.267)",
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "center",
	},
	disc: {
		width: DISC_SIZE,
		height: DISC_SIZE,
		borderRadius: DISC_SIZE / 2,
		backgroundColor: Ink.surface,
		alignItems: "center",
		justifyContent: "center",
	},
});
