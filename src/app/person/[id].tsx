import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ArrowLeftIcon from "@/assets/auth/arrow-left.svg";
import VerifiedIcon from "@/assets/search/verified-solid.svg";
import { GlassIconButton } from "@/components/ui/glass-icon-button";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StateMessage } from "@/components/ui/state-message";
import {
	AbsoluteFill,
	Brand,
	Gap,
	Ink,
	MaxColumnWidth,
	MediaScrim,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import type { ApiPersonProfile } from "@/lib/api/discovery-schema";
import { usePersonProfile } from "@/features/discover/use-discover";
import { formatDistance } from "@/utils/format";

const VERIFIED_SIZE = 24;
const DOT_SIZE = 14;
const DOT_RING = 2;
const SCRIM_HEIGHT = 325;
const PHOTO_INITIALS_SIZE = 96;

export default function PersonScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const profile = usePersonProfile(id ?? "");

	const goBack = () => (router.canGoBack() ? router.back() : router.replace("/discover"));

	if (profile.isPending) {
		return (
			<SafeAreaView style={styles.plain}>
				<StatusBar style="dark" />

				<GradientSpinner />
			</SafeAreaView>
		);
	}

	if (profile.isError || !profile.data) {
		return (
			<SafeAreaView style={styles.plain}>
				<StatusBar style="dark" />

				<View style={styles.errorBox}>
					<StateMessage
						actionLabel="Go back"
						isError
						message="We could not load this profile. It may no longer be available."
						onPressAction={goBack}
					/>
				</View>
			</SafeAreaView>
		);
	}

	return <PersonDetails onBack={goBack} person={profile.data} />;
}

type PersonDetailsProps = {
	person: ApiPersonProfile;
	onBack: () => void;
};

function initialsOf(fullName: string): string {
	const initials = fullName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

	return initials || "?";
}

function PersonDetails({ person, onBack }: PersonDetailsProps) {
	const distance = formatDistance(person.distanceKm);

	return (
		<View style={styles.screen}>
			<StatusBar style="light" />

			{person.avatarUrl ? (
				<Image
					accessibilityIgnoresInvertColors
					alt={`${person.fullName}'s photo`}
					contentFit="cover"
					source={{ uri: person.avatarUrl }}
					style={AbsoluteFill}
					transition={200}
				/>
			) : (
				<View style={[AbsoluteFill, styles.photoFallback]}>
					<Text style={styles.photoInitials}>{initialsOf(person.fullName)}</Text>
				</View>
			)}

			<View pointerEvents="none" style={styles.scrim} />

			<SafeAreaView edges={["top", "left", "right"]} style={styles.fill}>
				<View style={[styles.column, styles.header]}>
					<GlassIconButton
						Icon={ArrowLeftIcon}
						accessibilityLabel="Go back"
						onPress={onBack}
					/>

					<Text accessibilityRole="header" numberOfLines={1} style={styles.headerTitle}>
						Discover
					</Text>

					<View style={styles.headerEnd}>
						{person.isOnline ? (
							<View accessibilityLabel="Online now" style={styles.dot} />
						) : null}
					</View>
				</View>

				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.spacer} />

					<View style={[styles.column, styles.panel]}>
						<View style={styles.identity}>
							<View style={styles.tags}>
								<Text style={styles.name}>
									{person.age === null
										? person.fullName
										: `${person.fullName}, ${person.age}`}
								</Text>

								<View style={styles.metaRow}>
									<Text style={styles.category}>{person.category?.label ?? ""}</Text>

									<View style={styles.metaDot} />

									<Text style={styles.distance}>{distance}</Text>
								</View>

								{person.occupation ? (
									<Text style={styles.role}>{person.occupation.label}</Text>
								) : null}
							</View>

							{person.isVerified ? (
								<VerifiedIcon
									accessibilityLabel="Verified account"
									color={Brand.purple}
									height={VERIFIED_SIZE}
									width={VERIFIED_SIZE}
								/>
							) : null}
						</View>

						{person.bio ? (
							<View style={styles.bio}>
								<Text style={styles.bioText}>{person.bio}</Text>
							</View>
						) : null}

						{person.hobbies.length > 0 ? (
							<View style={styles.hobbies}>
								{person.hobbies.map((hobby) => (
									<View key={hobby.id} style={styles.hobby}>
										<Text style={styles.hobbyLabel}>{hobby.label}</Text>
									</View>
								))}
							</View>
						) : null}

						<PrimaryButton
							accessibilityHint={`Opens a conversation with ${person.fullName}`}
							label="Send Message"
							onPress={() => router.push("/chat")}
							tone="gradient"
						/>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.title,
	},
	plain: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.three,
		backgroundColor: Ink.surface,
	},
	errorBox: {
		width: "100%",
		maxWidth: MaxColumnWidth,
	},
	fill: {
		flex: 1,
	},
	// The frame blurs the foot of the photo. A gradient scrim is what the cards
	// already use for the same job, and it costs no native blur pass.
	/**
	 * Deliberately the dark brand purple rather than the pale surface the cards
	 * use: this screen lays white type and a darkening scrim straight over the
	 * photo, so a light stand-in would leave the name unreadable.
	 */
	photoFallback: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purple,
	},
	photoInitials: {
		...Type.profileName,
		fontSize: PHOTO_INITIALS_SIZE,
		lineHeight: PHOTO_INITIALS_SIZE * 1.1,
		color: Brand.onBrand,
	},
	scrim: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: SCRIM_HEIGHT,
		...MediaScrim,
	},
	column: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: Spacing.three,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.snug,
		paddingVertical: Spacing.two,
	},
	headerTitle: {
		...Type.subtitle,
		flexShrink: 1,
		color: Ink.onMedia,
	},
	headerEnd: {
		flex: 1,
		alignItems: "flex-end",
	},
	dot: {
		width: DOT_SIZE,
		height: DOT_SIZE,
		borderRadius: DOT_SIZE / 2,
		backgroundColor: Ink.online,
		borderWidth: DOT_RING,
		borderColor: Ink.surface,
	},
	content: {
		flexGrow: 1,
		paddingBottom: Spacing.four,
	},
	spacer: {
		flex: 1,
		minHeight: Spacing.six,
	},
	panel: {
		gap: Gap.card,
	},
	identity: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.three,
	},
	tags: {
		flexShrink: 1,
		gap: Spacing.half,
	},
	name: {
		...Type.detailName,
		color: Ink.onMedia,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		gap: Gap.tight,
	},
	category: {
		...Type.detailCategory,
		color: Ink.onMedia,
	},
	metaDot: {
		width: 3,
		height: 3,
		borderRadius: 1.5,
		backgroundColor: Ink.onMediaMuted,
	},
	distance: {
		...Type.detailRole,
		color: Ink.onMediaMuted,
	},
	role: {
		...Type.detailRole,
		color: Ink.onMedia,
	},
	bio: {
		padding: Gap.card,
		borderRadius: Radius.dialog,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Ink.mediaGlassBorder,
		backgroundColor: Ink.mediaGlass,
	},
	bioText: {
		...Type.detailBio,
		color: Ink.onMediaMuted,
	},
	hobbies: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Gap.snug,
	},
	hobby: {
		paddingHorizontal: Gap.snug,
		paddingVertical: Spacing.two,
		borderRadius: Radius.control,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Ink.mediaGlassBorder,
		backgroundColor: Ink.mediaGlass,
	},
	hobbyLabel: {
		...Type.hobbyLabel,
		color: Ink.onMediaMuted,
	},
});
