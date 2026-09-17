import { memo, useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { AvatarImage } from "@/components/ui/avatar-image";
import { Gap, Ink, Spacing, Type } from "@/constants/theme";
import type { ApiSupportMessage } from "@/lib/api/support-schema";

const AVATAR = 36;

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

/** A reply from the team (Figma 3101:2384). The frame has no detail screen, so the row opens in place. */
export const SupportMessageRow = memo(function SupportMessageRow({
	message,
}: {
	message: ApiSupportMessage;
}) {
	const [open, setOpen] = useState(false);
	const agent = message.agentName ?? "Support";

	const toggle = useCallback(() => {
		setOpen((value) => !value);
	}, []);

	return (
		<Pressable
			accessibilityLabel={`${agent}, ${message.subject ?? "message"}, ${formatDate(message.createdAt)}`}
			accessibilityRole="button"
			accessibilityState={{ expanded: open }}
			onPress={toggle}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			<AvatarImage fullName={agent} size={AVATAR} uri={null} />

			<View style={styles.text}>
				<View style={styles.heading}>
					<Text numberOfLines={1} style={styles.name}>
						{agent}
					</Text>

					<Text style={styles.date}>{formatDate(message.createdAt)}</Text>
				</View>

				<Text numberOfLines={open ? undefined : 1} style={styles.subject}>
					{message.subject ?? message.body}
				</Text>

				{open ? (
					<Animated.Text entering={FadeIn.duration(150)} style={styles.body}>
						{message.body}
					</Animated.Text>
				) : null}
			</View>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Gap.card,
		paddingVertical: Spacing.three,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Ink.border,
	},
	text: {
		flex: 1,
		gap: Spacing.one,
	},
	heading: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: Spacing.two,
	},
	name: {
		...Type.featureTitle,
		flexShrink: 1,
		color: Ink.title,
	},
	date: {
		...Type.footnote,
		color: Ink.muted,
	},
	subject: {
		...Type.slideBody,
		color: Ink.muted,
	},
	body: {
		...Type.slideBody,
		color: Ink.body,
		paddingTop: Spacing.two,
	},
	pressed: {
		opacity: 0.7,
	},
});
