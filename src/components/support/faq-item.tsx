import { memo, useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import ChevronDownIcon from "@/assets/settings/chevron-down.svg";
import { Brand, Gap, Ink, Radius, Spacing, Type } from "@/constants/theme";
import type { Faq } from "@/features/support/faqs";

const CHEVRON = 16;

/** One accordion row of the Help sheet (Figma 3101:1490). Opens on its own state. */
export const FaqItem = memo(function FaqItem({ faq }: { faq: Faq }) {
	const [open, setOpen] = useState(false);

	const toggle = useCallback(() => {
		setOpen((value) => !value);
	}, []);

	return (
		<View style={[styles.item, open && styles.itemOpen]}>
			<Pressable
				accessibilityLabel={faq.question}
				accessibilityRole="button"
				accessibilityState={{ expanded: open }}
				onPress={toggle}
				style={({ pressed }) => [styles.question, pressed && styles.pressed]}
			>
				<Text style={styles.questionText}>{faq.question}</Text>

				<View style={open && styles.chevronOpen}>
					<ChevronDownIcon color={Brand.purple} height={CHEVRON} width={CHEVRON} />
				</View>
			</Pressable>

			{open ? (
				<Animated.Text entering={FadeIn.duration(150)} style={styles.answer}>
					{faq.answer}
				</Animated.Text>
			) : null}
		</View>
	);
});

const styles = StyleSheet.create({
	item: {
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.surface,
		paddingHorizontal: Spacing.three,
	},
	itemOpen: {
		borderColor: Brand.purpleTint,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	question: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
		minHeight: 52,
		paddingVertical: Gap.card,
	},
	questionText: {
		...Type.action,
		flex: 1,
		color: Ink.title,
	},
	chevronOpen: {
		transform: [{ rotate: "180deg" }],
	},
	answer: {
		...Type.slideBody,
		color: Ink.muted,
		paddingBottom: Spacing.three,
	},
	pressed: {
		opacity: 0.7,
	},
});
