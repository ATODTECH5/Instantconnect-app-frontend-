import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/nav/screen-header";
import { CodeCard } from "@/components/referrals/code-card";
import { ProgressCard } from "@/components/referrals/progress-card";
import { ReferralRow } from "@/components/referrals/referral-row";
import { ShareRow } from "@/components/referrals/share-row";
import { StateMessage } from "@/components/ui/state-message";
import { Toast } from "@/components/ui/toast";
import { Gap, Ink, MaxColumnWidth, Spacing, Type } from "@/constants/theme";
import {
	copyInviteCode,
	copyInviteLink,
	shareInvite,
	type ShareTarget,
} from "@/features/referrals/share-invite";
import { useReferrals } from "@/features/referrals/use-referrals";
import { describeError } from "@/lib/api/api-error";
import type { ApiReferral, ApiReferrals } from "@/lib/api/referrals-schema";

const EDGE_INSET = Spacing.three;

/**
 * Refer a Friend share screen (Figma 3051:1359). The code, the share row and
 * the progress card head a list of every referral; a share that leaves the
 * app lands on the Invite Sent screen, a copy only raises the toast.
 */
export default function ReferShareScreen() {
	const referrals = useReferrals();
	const [notice, setNotice] = useState<string | null>(null);
	const goBack = useCallback(() => router.back(), []);

	const share = useCallback(
		async (target: ShareTarget, code: string) => {
			const left = await shareInvite(target, code);

			if (left) router.push("/profile/refer/sent");
		},
		[],
	);

	const openJoined = useCallback((referral: ApiReferral) => {
		router.push(`/profile/refer/joined/${referral.id}`);
	}, []);

	const renderItem = useCallback(
		({ item }: { item: ApiReferral }) => (
			<ReferralRow
				onPress={item.status === "joined" ? openJoined : undefined}
				referral={item}
			/>
		),
		[openJoined],
	);

	const data = referrals.data;

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Refer a Friend" />

				{notice ? <Toast message={notice} onDismiss={() => setNotice(null)} /> : null}

				{referrals.isPending ? (
					<StateMessage message="Fetching your invite code…" />
				) : referrals.isError || !data ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={referrals.error ? describeError(referrals.error) : "Something went wrong."}
						onPressAction={() => void referrals.refetch()}
					/>
				) : (
					<FlatList
						ListEmptyComponent={
							<StateMessage message="Nobody has used your code yet. Share it and your friends will show up here." />
						}
						ListHeaderComponent={
							<Header
								data={data}
								onCopyCode={() => {
									copyInviteCode(data.code);
									setNotice("Code copied");
								}}
								onCopyLink={() => {
									copyInviteLink(data.code);
									setNotice("Invite link copied");
								}}
								onShare={(target) => void share(target, data.code)}
							/>
						}
						contentContainerStyle={styles.list}
						data={data.items}
						keyExtractor={(referral) => referral.id}
						renderItem={renderItem}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}

type HeaderProps = {
	data: ApiReferrals;
	onCopyCode: () => void;
	onCopyLink: () => void;
	onShare: (target: ShareTarget) => void;
};

function Header({ data, onCopyCode, onCopyLink, onShare }: HeaderProps) {
	return (
		<View style={styles.header}>
			<CodeCard code={data.code} onCopy={onCopyCode} />
			<ShareRow onCopyLink={onCopyLink} onShare={onShare} />
			<ProgressCard goal={data.goal} joinedCount={data.joinedCount} />
			<Text style={styles.sectionTitle}>Referral History</Text>
		</View>
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
	list: {
		gap: Spacing.two,
		paddingTop: Spacing.one,
		paddingBottom: Spacing.five,
	},
	header: {
		gap: Spacing.three,
		paddingBottom: Spacing.one,
	},
	sectionTitle: {
		...Type.docSection,
		color: Ink.body,
	},
});
