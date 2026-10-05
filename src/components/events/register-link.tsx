import { Pressable, StyleSheet, Text } from "react-native";

import ArrowRightIcon from "@/assets/connections/arrow-right.svg";
import { Brand, Spacing, Type } from "@/constants/theme";
import { externalSourceName, openRegistration } from "@/features/events/event-source";
import type { ApiEventSummary } from "@/lib/api/event-schema";

const ARROW = 12;
/** Lifts the 20pt line to a 44pt target without making the card taller. */
const HIT_SLOP = { top: 12, bottom: 12, left: 8, right: 8 };

export type RegisterLinkProps = {
	event: Pick<ApiEventSummary, "source" | "externalUrl">;
};

/** Renders nothing for member events, which are joined in the app. */
export function RegisterLink({ event }: RegisterLinkProps) {
	const sourceName = externalSourceName(event);
	const url = event.externalUrl;

	if (!sourceName || !url) return null;

	return (
		<Pressable
			accessibilityHint={`Opens the event on ${sourceName} to register or buy a ticket`}
			accessibilityLabel={`Register on ${sourceName}`}
			accessibilityRole="link"
			hitSlop={HIT_SLOP}
			onPress={() => void openRegistration(url)}
			style={({ pressed }) => [styles.link, pressed && styles.pressed]}
		>
			<Text numberOfLines={1} style={styles.label}>
				Register on {sourceName}
			</Text>

			<ArrowRightIcon color={Brand.purple} height={ARROW} width={ARROW} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	link: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		gap: Spacing.half,
	},
	label: {
		...Type.sectionLink,
		flexShrink: 1,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.6,
	},
});
