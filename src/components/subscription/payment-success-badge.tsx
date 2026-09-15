import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { BrandGradient, BrandGradientStops, Ink } from "@/constants/theme";

const RING_SIZE = 96;
const RING_BORDER = 2;
const DISC_SIZE = 69;
const CHECK_SIZE = 35;

/** Check endpoints from the frame, in disc local coordinates. */
const CHECK_PATH = "M28.8 8.64L12.96 24.48L5.76 17.28";
const CHECK_AXIS = { x1: 50.9, y1: 25, x2: 20.3, y2: -11 } as const;

/**
 * A gradient ring around a white disc, with the tick drawn in the same
 * gradient. `SuccessBadge` is the auth flow's translucent version for use on
 * the gradient screens; this one sits on white.
 */
export function PaymentSuccessBadge() {
	return (
		<View
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			style={styles.ring}
		>
			<View style={styles.disc}>
				<Svg height={CHECK_SIZE} viewBox="0 0 34.56 34.56" width={CHECK_SIZE}>
					<Defs>
						<LinearGradient
							gradientUnits="userSpaceOnUse"
							id="paymentCheck"
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
						stroke="url(#paymentCheck)"
						strokeLinecap="round"
						strokeWidth="3.84"
					/>
				</Svg>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	ring: {
		width: RING_SIZE,
		height: RING_SIZE,
		borderRadius: RING_SIZE / 2,
		borderWidth: RING_BORDER,
		borderColor: Ink.surface,
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "center",
		...BrandGradient,
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
