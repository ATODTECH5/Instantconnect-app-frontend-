import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { CircleRow } from "@/components/safety/circle-row";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import {
	useCircles,
	useDispatchPlan,
	useSelectCircles,
	useSendCheckIn,
} from "@/features/safety/use-safety";
import { describeError } from "@/lib/api/api-error";

const EDGE_INSET = Spacing.three;

/**
 * The Safety Dispatch frame. Tapping a circle toggles it and the selection is
 * saved at once, so the automatic check-ins (on verification, on end) use
 * what is ticked here even if the user never presses Broadcast.
 */
export default function SafetyDispatchScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const circles = useCircles();
	const plan = useDispatchPlan(id);
	const select = useSelectCircles(id);
	const send = useSendCheckIn(id);
	const [sentSummary, setSentSummary] = useState<string | null>(null);
	const goBack = useCallback(() => router.back(), []);

	const selected = new Set(plan.data?.circleIds ?? []);

	const toggle = (circleId: string) => {
		const next = new Set(selected);

		if (next.has(circleId)) next.delete(circleId);
		else next.add(circleId);

		select.mutate([...next]);
	};

	const broadcast = () => {
		send.mutate(undefined, {
			onSuccess: (result) => {
				setSentSummary(
					result.sent > 0
						? `Sent to ${result.sent} contact${result.sent === 1 ? "" : "s"}.${result.alreadySent > 0 ? ` ${result.alreadySent} already had it.` : ""}`
						: result.alreadySent > 0
							? "Everyone in those circles has already been told."
							: "No one to send to yet. Add contacts to a circle first.",
				);
			},
		});
	};

	const error = select.error ?? send.error ?? null;
	const busy = select.isPending || send.isPending;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Safety Dispatch" />

				<ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
					<View style={styles.intro}>
						<Text style={styles.heading}>Dispatch Safe Check-In</Text>
						<Text style={styles.lead}>
							Select trusted safety circles to receive confirmation of your safe meetup.
						</Text>
					</View>

					{error ? <FormErrorBanner message={describeError(error)} /> : null}

					{circles.isPending || plan.isPending ? (
						<StateMessage message="Loading your circles…" />
					) : circles.isError ? (
						<StateMessage
							actionLabel="Try again"
							isError
							message={describeError(circles.error)}
							onPressAction={() => void circles.refetch()}
						/>
					) : plan.isError ? (
						<StateMessage
							actionLabel="Try again"
							isError
							message={describeError(plan.error)}
							onPressAction={() => void plan.refetch()}
						/>
					) : circles.data.length === 0 ? (
						<StateMessage
							actionLabel="Set up a circle"
							message="You have no safety circles yet. Add the people who should hear you arrived safely."
							onPressAction={() => router.push("/profile/circles")}
						/>
					) : (
						<>
							<View style={styles.list}>
								{circles.data.map((circle) => (
									<CircleRow
										accessibilityHint="Toggles whether this circle is told about this meetup"
										disabled={busy}
										key={circle.id}
										name={circle.name}
										onPress={() => toggle(circle.id)}
										selected={selected.has(circle.id)}
										subtitle={`${circle.members.length} member${circle.members.length === 1 ? "" : "s"}`}
									/>
								))}
							</View>

							<View style={styles.preview}>
								<Text style={styles.previewLabel}>MESSAGE PREVIEW</Text>
								<Text style={styles.previewBody}>{plan.data.preview}</Text>
							</View>

							{sentSummary ? (
								<Text accessibilityRole="alert" style={styles.sent}>
									{sentSummary}
								</Text>
							) : null}

							<PrimaryButton
								accessibilityHint="Emails the selected circles now"
								disabled={selected.size === 0 || busy}
								label="Broadcast Confirmation"
								loading={send.isPending}
								onPress={broadcast}
							/>
						</>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	column: {
		flex: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
		paddingTop: Spacing.two,
		gap: Gap.card,
	},
	body: {
		flexGrow: 1,
		gap: Gap.section,
		paddingBottom: Spacing.five,
	},
	intro: {
		gap: Spacing.two,
	},
	heading: {
		...Type.heroTitle,
		color: Ink.title,
	},
	lead: {
		...Type.slideBody,
		color: Ink.muted,
	},
	list: {
		gap: Gap.card,
	},
	preview: {
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.media,
		padding: Spacing.three,
		gap: Spacing.two,
		backgroundColor: Ink.surface,
	},
	previewLabel: {
		...Type.cardMeta,
		color: Ink.muted,
		letterSpacing: 0.8,
	},
	previewBody: {
		...Type.slideBody,
		color: Ink.title,
	},
	sent: {
		...Type.cardMeta,
		color: Ink.success,
		textAlign: "center",
	},
});
