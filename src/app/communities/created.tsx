import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SuccessBadge } from "@/components/auth/success-badge";
import { CommunityInviteSheet } from "@/components/communities/community-invite-sheet";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StateMessage } from "@/components/ui/state-message";
import {
	Brand,
	BrandGradient,
	Gap,
	Ink,
	MaxColumnWidth,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import { communityInitials, memberCountLabel } from "@/features/communities/community-copy";
import { useCommunity } from "@/features/communities/use-communities";
import { describeError } from "@/lib/api/api-error";

const LOGO = 56;

/** The confirmation after Create Community, with the new community's card. */
export default function CommunityCreatedScreen() {
	const { id = "" } = useLocalSearchParams<{ id: string }>();
	const community = useCommunity(id);
	const [inviting, setInviting] = useState(false);

	const open = () => router.replace(`/communities/${id}`);

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.top}>
					<SuccessBadge />

					<Text accessibilityRole="header" style={styles.title}>
						Community has been created
					</Text>

					{community.isPending ? (
						<StateMessage message="Loading community…" />
					) : community.isError ? (
						<StateMessage
							actionLabel="Try again"
							isError
							message={describeError(community.error)}
							onPressAction={() => void community.refetch()}
						/>
					) : (
						<>
							<Text style={styles.body}>
								Your {community.data.name} community is now online. Let&apos;s make
								something amazing together.
							</Text>

							<View style={styles.card}>
								<View style={[styles.logo, BrandGradient]}>
									<Text style={styles.logoLabel}>
										{communityInitials(community.data.name)}
									</Text>
								</View>

								<View style={styles.cardCopy}>
									<Text numberOfLines={1} style={styles.cardName}>
										{community.data.name}
									</Text>
									<Text numberOfLines={1} style={styles.cardMeta}>
										{[
											community.data.category?.label,
											memberCountLabel(community.data.memberCount),
										]
											.filter(Boolean)
											.join(" • ")}
									</Text>
								</View>
							</View>
						</>
					)}
				</View>

				<View style={styles.actions}>
					<PrimaryButton label="Go to Community" onPress={open} />
					<SecondaryButton
						disabled={!community.data}
						label="Invite More People"
						onPress={() => setInviting(true)}
						tone="brand"
					/>
				</View>
			</ScrollView>

			{community.data ? (
				<CommunityInviteSheet
					community={{ id: community.data.id, name: community.data.name }}
					onDismiss={() => setInviting(false)}
					visible={inviting}
				/>
			) : null}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	content: {
		flexGrow: 1,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		justifyContent: "space-between",
		padding: Spacing.three,
		paddingTop: Spacing.six,
		gap: Spacing.five,
	},
	top: {
		alignItems: "center",
		gap: Gap.card,
	},
	title: {
		...Type.subtitle,
		color: Ink.title,
		textAlign: "center",
	},
	body: {
		...Type.successBody,
		color: Ink.muted,
		textAlign: "center",
	},
	card: {
		alignSelf: "stretch",
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		marginTop: Spacing.four,
		padding: Spacing.three,
		borderRadius: Radius.media,
		borderWidth: 1,
		borderColor: Ink.border,
		backgroundColor: Ink.keypad,
	},
	logo: {
		width: LOGO,
		height: LOGO,
		borderRadius: Radius.media,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purple,
	},
	logoLabel: {
		...Type.subtitle,
		color: Brand.onBrand,
	},
	cardCopy: {
		flex: 1,
		gap: Spacing.half,
	},
	cardName: {
		...Type.resultName,
		color: Ink.title,
	},
	cardMeta: {
		...Type.cardMeta,
		color: Ink.meta,
	},
	actions: {
		gap: Gap.card,
	},
});
