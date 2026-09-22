import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ShieldCheckIcon from "@/assets/subscription/shield-check.svg";
import AlertIcon from "@/assets/settings/alert-triangle.svg";
import { InfoCard } from "@/components/kyc/info-card";
import { KYC_SECURE_LABEL } from "@/components/kyc/kyc-step-frame";
import { SubmittedView } from "@/components/kyc/submitted-view";
import { Timeline, type TimelineItem } from "@/components/kyc/timeline";
import { ScreenHeader } from "@/components/nav/screen-header";
import { SecuredBadge } from "@/components/subscription/secured-badge";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import { Brand, Ink, MaxColumnWidth, Spacing } from "@/constants/theme";
import { KYC_STEPS, type KycDraft, type KycStepKey, nextKycStep, useKycDraft } from "@/features/kyc/kyc-draft-store";
import { useKycOverview } from "@/features/kyc/use-kyc";
import { describeError } from "@/lib/api/api-error";
import { formatDate } from "@/utils/format";

const EDGE_INSET = Spacing.three;
const HERO_SIZE = 64;
const HERO_ICON = 28;

const STEP_TITLES: Record<KycStepKey, string> = {
	id: "ID Verification",
	address: "Proof Of Address",
	kin: "Next Of Kin",
	selfie: "Facial Recognition",
};

const STEP_ROUTES: Record<KycStepKey, `/profile/kyc/${KycStepKey}`> = {
	id: "/profile/kyc/id",
	address: "/profile/kyc/address",
	kin: "/profile/kyc/kin",
	selfie: "/profile/kyc/selfie",
};

/**
 * KYC Verification (Figma 2748:3269). One route, three faces: the stepper
 * before anything is submitted (and again after a rejection, with the
 * reason), the submitted frame while the review is pending, and the same
 * stepper fully ticked once verified.
 */
export default function KycScreen() {
	const overview = useKycOverview();
	const draft = useKycDraft();
	const goBack = useCallback(() => router.back(), []);
	const goHome = useCallback(() => router.dismissTo("/(tabs)"), []);

	const begin = useCallback(() => {
		router.push(STEP_ROUTES[nextKycStep(draft) ?? "id"]);
	}, [draft]);

	if (overview.isPending || overview.isError) {
		return (
			<Frame onBack={goBack}>
				{overview.isPending ? (
					<StateMessage message="Checking your verification status…" />
				) : (
					<StateMessage
						actionLabel="Try again"
						isError
						message={describeError(overview.error)}
						onPressAction={() => void overview.refetch()}
					/>
				)}
			</Frame>
		);
	}

	const { status, submission } = overview.data;

	if (status === "pending") {
		return (
			<Frame footer={<PrimaryButton label="Home" onPress={goHome} />} onBack={goBack}>
				<SubmittedView />
			</Frame>
		);
	}

	const verified = status === "verified";
	const started = nextKycStep(draft) !== "id";

	return (
		<Frame
			footer={
				verified ? (
					<PrimaryButton label="Back to profile" onPress={goBack} />
				) : (
					<PrimaryButton
						label={
							status === "rejected"
								? "Try Again"
								: started
									? "Continue Verification"
									: "Begin Verification"
						}
						onPress={begin}
					/>
				)
			}
			onBack={goBack}
		>
			<View style={styles.hero}>
				<ShieldCheckIcon color={Brand.purple} height={HERO_ICON} width={HERO_ICON} />
			</View>

			<Timeline items={stepItems(draft, verified)} />

			{verified ? (
				<InfoCard
					body={
						submission?.reviewedAt
							? `Approved on ${formatDate(submission.reviewedAt)}. The verified badge is on your profile.`
							: "The verified badge is on your profile."
					}
					Icon={ShieldCheckIcon}
					title="You are verified"
				/>
			) : status === "rejected" && submission?.rejectionReason ? (
				<InfoCard
					body={submission.rejectionReason}
					Icon={AlertIcon}
					title="We could not verify your documents"
				/>
			) : (
				<InfoCard
					body="KYC helps protect your account from fraud, prevents identity theft, and ensures safety. The process typically takes only 2-5 minutes."
					title="Why is this needed?"
				/>
			)}
		</Frame>
	);
}

function stepItems(draft: KycDraft, verified: boolean): TimelineItem[] {
	return [
		{
			key: "intro",
			title: "Verify Your Identity",
			body: "To ensure safety and trust for all users, we require a quick identity verification.",
			tone: verified ? "done" : "current",
		},
		...KYC_STEPS.map<TimelineItem>((step) => ({
			key: step,
			title: STEP_TITLES[step],
			tone: verified || draft[step] !== null ? "done" : "todo",
		})),
	];
}

function Frame({
	children,
	footer,
	onBack,
}: {
	children: ReactNode;
	footer?: ReactNode;
	onBack: () => void;
}) {
	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={onBack} title="KYC Verification" />

				<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
					{children}
				</ScrollView>

				{footer ? (
					<View style={styles.footer}>
						<SecuredBadge label={KYC_SECURE_LABEL} />
						{footer}
					</View>
				) : null}
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
	},
	content: {
		flexGrow: 1,
		gap: Spacing.four,
		paddingTop: Spacing.three,
		paddingBottom: Spacing.three,
	},
	hero: {
		alignSelf: "center",
		width: HERO_SIZE,
		height: HERO_SIZE,
		borderRadius: HERO_SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: Brand.purpleTint,
		backgroundColor: Ink.surface,
	},
	footer: {
		gap: Spacing.one,
		paddingBottom: Spacing.two,
	},
});
