import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CheckIcon from "@/assets/auth/check.svg";
import GiftIcon from "@/assets/profile/gift.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import {
	Brand,
	BrandGradient,
	Gap,
	Ink,
	MaxColumnWidth,
	MinTapTarget,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import { ACTIVE_PRIVILEGES } from "@/features/referrals/perks";
import { useReferral } from "@/features/referrals/use-referrals";
import { useCurrentUser } from "@/features/user/use-current-user";
import { describeError } from "@/lib/api/api-error";

const EDGE_INSET = Spacing.three;
const AVATAR = 64;
const AVATAR_OVERLAP = 20;
const BADGE = 28;
const BADGE_ICON = 14;
const CHECK = 12;

/**
 * "Your friend joined" (Figma 3051:1787). Opened from a joined row in the
 * history and from the referral notification, which carries the referral id.
 */
export default function ReferralJoinedScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const referral = useReferral(id);
	const me = useCurrentUser();
	const goBack = useCallback(() => router.back(), []);
	const viewProfile = useCallback(() => router.dismissTo("/(tabs)/profile"), []);
	const inviteMore = useCallback(() => router.navigate("/profile/refer/share"), []);

	const friend = referral.data;
	const firstName = friend?.fullName.split(" ")[0] ?? "";

	return (
		<SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.column}>
				<ScreenHeader onBack={goBack} title="Refer a Friend" />

				{referral.isPending ? (
					<StateMessage message="Loading…" />
				) : referral.isError || !friend ? (
					<StateMessage
						actionLabel="Try again"
						isError
						message={
							referral.error ? describeError(referral.error) : "Something went wrong."
						}
						onPressAction={() => void referral.refetch()}
					/>
				) : (
					<ScrollView
						contentContainerStyle={styles.content}
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.pair}>
							<AvatarImage
								fullName={me.data?.fullName ?? "You"}
								size={AVATAR}
								uri={null}
							/>

							<View style={styles.badge}>
								<GiftIcon
									color={Brand.onBrand}
									height={BADGE_ICON}
									width={BADGE_ICON}
								/>
							</View>

							<View style={styles.friendAvatar}>
								<AvatarImage
									fullName={friend.fullName}
									size={AVATAR}
									uri={friend.avatarUrl}
								/>
							</View>
						</View>

						<View style={styles.copy}>
							<Text accessibilityRole="header" style={styles.title}>
								Your friend {firstName} joined!
							</Text>

							<Text style={styles.body}>
								Great news! {friend.fullName} has successfully registered with your
								code. You have both unlocked your community privileges.
							</Text>
						</View>

						<View style={styles.card}>
							<Text style={styles.cardHeading}>Active privileges</Text>

							{ACTIVE_PRIVILEGES.map((privilege) => (
								<View key={privilege.id} style={styles.privilege}>
									<CheckIcon color={Ink.success} height={CHECK} width={CHECK} />

									<View style={styles.privilegeText}>
										<Text style={styles.privilegeTitle}>{privilege.title}</Text>
										<Text style={styles.privilegeDetail}>
											{privilege.detail}
										</Text>
									</View>
								</View>
							))}
						</View>

						<View style={styles.actions}>
							<PrimaryButton label="View Your Profile" onPress={viewProfile} />

							<Pressable
								accessibilityLabel="Invite more friends"
								accessibilityRole="link"
								onPress={inviteMore}
								style={({ pressed }) => [styles.link, pressed && styles.pressed]}
							>
								<Text style={styles.linkLabel}>Invite More Friends</Text>
							</Pressable>
						</View>
					</ScrollView>
				)}
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
	content: {
		flexGrow: 1,
		alignItems: "center",
		gap: Spacing.four,
		paddingTop: Spacing.four,
		paddingBottom: Spacing.five,
	},
	pair: {
		flexDirection: "row",
		alignItems: "center",
	},
	friendAvatar: {
		marginLeft: -AVATAR_OVERLAP,
	},
	/** Sits low on the seam so it never covers either set of initials. */
	badge: {
		...BrandGradient,
		zIndex: 1,
		alignSelf: "flex-end",
		width: BADGE,
		height: BADGE,
		marginHorizontal: -BADGE / 2 + AVATAR_OVERLAP / 2,
		borderRadius: BADGE / 2,
		borderWidth: 2,
		borderColor: Ink.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	copy: {
		alignItems: "center",
		gap: Gap.snug,
	},
	title: {
		...Type.successTitle,
		color: Ink.title,
		textAlign: "center",
	},
	body: {
		...Type.slideBody,
		color: Ink.meta,
		textAlign: "center",
	},
	card: {
		width: "100%",
		gap: Spacing.three,
		padding: Spacing.three,
		borderWidth: 1,
		borderColor: Brand.purpleTint,
		borderRadius: Radius.dialog,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	cardHeading: {
		...Type.overline,
		fontFamily: Type.cta.fontFamily,
		fontSize: 13,
		color: Brand.purple,
		textTransform: "uppercase",
	},
	privilege: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Gap.snug,
	},
	privilegeText: {
		flex: 1,
		gap: Spacing.half,
	},
	privilegeTitle: {
		...Type.fieldValue,
		fontFamily: Type.action.fontFamily,
		color: Ink.title,
	},
	privilegeDetail: {
		...Type.footnote,
		color: Ink.muted,
	},
	actions: {
		width: "100%",
		gap: Spacing.two,
		paddingTop: Spacing.one,
	},
	link: {
		minHeight: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
	},
	linkLabel: {
		...Type.action,
		color: Brand.purple,
		textDecorationLine: "underline",
	},
	pressed: {
		opacity: 0.7,
	},
});
