import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PinIcon from "@/assets/home/pin-solid.svg";
import VerifiedIcon from "@/assets/search/verified-solid.svg";
import BlockedIcon from "@/assets/profile/blocked.svg";
import CreateEventIcon from "@/assets/profile/create-event.svg";
import CrownIcon from "@/assets/profile/crown.svg";
import EditProfileIcon from "@/assets/profile/edit-profile.svg";
import GiftIcon from "@/assets/profile/gift.svg";
import HelpIcon from "@/assets/profile/help.svg";
import KycIcon from "@/assets/profile/kyc.svg";
import SettingsIcon from "@/assets/profile/settings.svg";
import TermsIcon from "@/assets/profile/terms.svg";
import {
	ProfileMenuGroup,
	ProfileMenuRow,
} from "@/components/profile/profile-menu-row";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { ProfileStats } from "@/components/profile/profile-stats";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { StateMessage } from "@/components/ui/state-message";
import {
	Brand,
	Gap,
	Ink,
	MaxColumnWidth,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import { useProfile } from "@/features/profile/use-profile";
import { useNavBarInset } from "@/hooks/use-nav-bar-inset";

const AVATAR_SIZE = 104;
const META_ICON = 14;
const VERIFIED_SIZE = 18;

export default function ProfileScreen() {
	const navInset = useNavBarInset();
	const profile = useProfile();

	function renderBody() {
		if (profile.isPending) {
			return (
				<View style={styles.centre}>
					<GradientSpinner />

					<Text style={styles.loadingLabel}>Loading your profile</Text>
				</View>
			);
		}

		if (profile.isError || !profile.data) {
			return (
				<View style={styles.centre}>
					<StateMessage
						actionLabel="Try again"
						isError
						message="We could not load your profile. Check your connection and try again."
						onPressAction={() => void profile.refetch()}
					/>
				</View>
			);
		}

		const { data } = profile;
		const meta = [data.occupation?.label, data.locationLabel].filter(Boolean);

		return (
			<ScrollView
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: navInset + Spacing.four },
				]}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.identity}>
					<ProfileAvatar
						fullName={data.fullName}
						size={AVATAR_SIZE}
						uri={data.avatarUrl}
					/>

					<View style={styles.nameRow}>
						<Text accessibilityRole="header" numberOfLines={1} style={styles.name}>
							{data.fullName}
						</Text>

						{data.isVerified ? (
							<VerifiedIcon
								accessibilityLabel="Verified account"
								color={Brand.purple}
								height={VERIFIED_SIZE}
								width={VERIFIED_SIZE}
							/>
						) : null}
					</View>

					{meta.length > 0 ? (
						<View style={styles.metaRow}>
							{data.occupation ? (
								<Text numberOfLines={1} style={styles.meta}>
									{data.occupation.label}
								</Text>
							) : null}

							{data.occupation && data.locationLabel ? (
								<View style={styles.metaDivider} />
							) : null}

							{data.locationLabel ? (
								<View style={styles.location}>
									<PinIcon
										color={Brand.purple}
										height={META_ICON}
										width={META_ICON}
									/>

									<Text numberOfLines={1} style={styles.meta}>
										{data.locationLabel}
									</Text>
								</View>
							) : null}
						</View>
					) : null}
				</View>

				<ProfileStats
					communities={data.stats.communities}
					connections={data.stats.connections}
					eventsJoined={data.stats.eventsJoined}
				/>

				<ProfileMenuGroup>
					<ProfileMenuRow
						Icon={EditProfileIcon}
						label="Edit Profile"
						onPress={() => router.push("/profile/edit")}
					/>

					<ProfileMenuRow
						badge={data.kycStatus === "pending" ? { label: "Pending", tone: "pending" } : null}
						Icon={KycIcon}
						label="KYC Verification"
						onPress={() => router.push("/profile/kyc")}
					/>

					<ProfileMenuRow
						Icon={BlockedIcon}
						isLast
						label="Blocked Users"
						onPress={() => router.push("/profile/blocked")}
					/>
				</ProfileMenuGroup>

				<ProfileMenuGroup>
					<ProfileMenuRow
						Icon={CrownIcon}
						isLast
						label="Subscription Plans"
						onPress={() => router.push("/profile/subscription")}
					/>
				</ProfileMenuGroup>

				<ProfileMenuGroup>
					<ProfileMenuRow
						Icon={CreateEventIcon}
						isLast
						label="Create Event"
						onPress={() => router.push("/profile/create-event")}
					/>
				</ProfileMenuGroup>

				<ProfileMenuGroup>
					<ProfileMenuRow
						Icon={GiftIcon}
						label="Refer a Friend"
						onPress={() => router.push("/profile/refer")}
					/>

					<ProfileMenuRow
						Icon={SettingsIcon}
						label="Settings"
						onPress={() => router.push("/profile/settings")}
					/>

					<ProfileMenuRow
						Icon={HelpIcon}
						isLast
						label="Help & Support"
						onPress={() => router.push("/profile/support")}
					/>
				</ProfileMenuGroup>

				<ProfileMenuGroup>
					<ProfileMenuRow
						Icon={TermsIcon}
						isLast
						label="Terms & Conditions"
						onPress={() => router.push("/terms")}
					/>
				</ProfileMenuGroup>
			</ScrollView>
		);
	}

	return (
		<SafeAreaView edges={["top"]} style={styles.screen}>
			<StatusBar style="dark" />

			<View style={styles.header}>
				<Text accessibilityRole="header" style={styles.screenTitle}>
					Profile
				</Text>
			</View>

			{renderBody()}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	header: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: Spacing.three,
		paddingBottom: Spacing.two,
	},
	screenTitle: {
		...Type.screenTitle,
		color: Ink.title,
	},
	content: {
		flexGrow: 1,
		gap: Gap.card,
		paddingHorizontal: Spacing.three,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
	},
	loadingLabel: {
		...Type.profileMeta,
		color: Ink.muted,
	},
	centre: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
	},
	identity: {
		alignItems: "center",
		gap: Gap.tight,
		paddingVertical: Spacing.four,
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.media,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	nameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.tight,
		marginTop: Spacing.two,
	},
	name: {
		...Type.profileName,
		flexShrink: 1,
		color: Ink.title,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: Gap.snug,
	},
	metaDivider: {
		width: 1,
		height: 14,
		backgroundColor: Ink.borderStrong,
	},
	location: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
		flexShrink: 1,
	},
	meta: {
		...Type.profileMeta,
		flexShrink: 1,
		color: Ink.muted,
	},
});
