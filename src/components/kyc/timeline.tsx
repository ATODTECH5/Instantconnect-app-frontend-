import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import CheckIcon from "@/assets/auth/check.svg";
import { Brand, Ink, Spacing, Type } from "@/constants/theme";

const DOT_SIZE = 16;
const CHECK_SIZE = 10;
const LINE_WIDTH = 2;

export type TimelineTone = "done" | "current" | "todo";

export type TimelineItem = {
	key: string;
	title: string;
	body?: string;
	tone: TimelineTone;
};

/**
 * A vertical stepper: the hub's verification list and the submitted screen's
 * "What happens next?" share it, differing only in copy and the tone of each
 * row. The line between dots takes the tone of the row above it.
 */
export function Timeline({ items, header }: { items: TimelineItem[]; header?: ReactNode }) {
	return (
		<View accessibilityRole="list" style={styles.list}>
			{header}

			{items.map((item, index) => {
				const isLast = index === items.length - 1;

				return (
					<View
						accessibilityLabel={`${item.title}${item.body ? `. ${item.body}` : ""}, ${describe(item.tone)}`}
						key={item.key}
						style={styles.row}
					>
						<View style={styles.rail}>
							<View style={[styles.dot, dotStyle[item.tone]]}>
								{item.tone === "done" ? (
									<CheckIcon color={Ink.surface} height={CHECK_SIZE} width={CHECK_SIZE} />
								) : item.tone === "current" ? (
									<View style={styles.core} />
								) : null}
							</View>
							{!isLast ? (
								<View style={[styles.line, item.tone === "done" && styles.lineDone]} />
							) : null}
						</View>

						<View style={[styles.text, !isLast && styles.textSpaced]}>
							<Text style={[styles.title, titleStyle[item.tone]]}>{item.title}</Text>
							{item.body ? <Text style={styles.body}>{item.body}</Text> : null}
						</View>
					</View>
				);
			})}
		</View>
	);
}

function describe(tone: TimelineTone): string {
	return tone === "done" ? "complete" : tone === "current" ? "in progress" : "not started";
}

const styles = StyleSheet.create({
	list: {
		gap: 0,
	},
	row: {
		flexDirection: "row",
		gap: Spacing.three,
	},
	rail: {
		alignItems: "center",
		width: DOT_SIZE,
	},
	dot: {
		width: DOT_SIZE,
		height: DOT_SIZE,
		borderRadius: DOT_SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
		marginTop: Spacing.half,
	},
	core: {
		width: DOT_SIZE / 2.5,
		height: DOT_SIZE / 2.5,
		borderRadius: DOT_SIZE / 5,
		backgroundColor: Brand.purple,
	},
	line: {
		flex: 1,
		width: LINE_WIDTH,
		marginVertical: Spacing.one,
		backgroundColor: Ink.border,
	},
	lineDone: {
		backgroundColor: Ink.success,
	},
	text: {
		flex: 1,
		gap: Spacing.half,
	},
	textSpaced: {
		paddingBottom: Spacing.four,
	},
	title: {
		...Type.noticeTitle,
	},
	body: {
		...Type.profileMeta,
		color: Ink.meta,
	},
});

const dotStyle = StyleSheet.create({
	done: { backgroundColor: Ink.success },
	current: { borderWidth: 1.5, borderColor: Brand.purple, backgroundColor: Ink.surface },
	todo: { borderWidth: 1.5, borderColor: Ink.border, backgroundColor: Ink.surface },
});

const titleStyle = StyleSheet.create({
	done: { color: Ink.title },
	current: { color: Brand.purple },
	todo: { color: Ink.muted },
});
