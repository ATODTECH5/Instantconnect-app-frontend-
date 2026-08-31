import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import VerifiedIcon from "@/assets/home/verified.svg";
import { GradientFrame } from "@/components/ui/gradient-frame";
import {
	AbsoluteFill,
	Brand,
	Gap,
	Ink,
	MediaScrim,
	Radius,
	Spacing,
	Type,
} from "@/constants/theme";
import {
	CONNECT_LABEL,
	isConnectPressable,
	type ConnectAction,
} from "@/features/discover/connect-action";
import type { ApiNearbyPerson } from "@/lib/api/discovery-schema";
import { formatDistance } from "@/utils/format";

export const PERSON_CARD_ASPECT = 171 / 212;

const BADGE_ICON = 12;
const CONNECT_MIN_HEIGHT = 32;
const CONNECT_HIT_SLOP = 8;

function initialsOf(fullName: string): string {
	const initials = fullName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

	return initials || "?";
}

export type PersonCardProps = {
	person: ApiNearbyPerson;
	width: number;
	action: ConnectAction;
	onOpen: (id: string) => void;
	onConnect: (id: string) => void;
};

export const PersonCard = memo(function PersonCard({
	person,
	width,
	action,
	onOpen,
	onConnect,
}: PersonCardProps) {
	const { id, fullName, age, category, occupation, distanceKm, avatarUrl, isVerified } = person;

	const heading = age === null ? fullName : `${fullName}, ${age}`;
	const meta = [category?.label, formatDistance(distanceKm)].filter(Boolean).join(" • ");
	const role = occupation?.label ?? "";
	const canPress = isConnectPressable(action);

	return (
		<GradientFrame radius={Radius.media} style={{ width, aspectRatio: PERSON_CARD_ASPECT }}>
			<Pressable
				accessibilityHint="Opens this profile"
				accessibilityLabel={[heading, meta, role, isVerified ? "Verified" : ""]
					.filter(Boolean)
					.join(". ")}
				accessibilityRole="button"
				onPress={() => onOpen(id)}
				style={styles.pressable}
			>
				{avatarUrl ? (
					<Image
						accessibilityIgnoresInvertColors
						contentFit="cover"
						source={{ uri: avatarUrl }}
						style={AbsoluteFill}
						transition={200}
					/>
				) : (
					<View style={[AbsoluteFill, styles.placeholder]}>
						<Text style={styles.initials}>{initialsOf(fullName)}</Text>
					</View>
				)}

				<View style={[AbsoluteFill, styles.scrim]} />

				<View style={styles.topRow}>
					{isVerified ? (
						<View style={styles.badge}>
							<VerifiedIcon
								color={Brand.onBrand}
								height={BADGE_ICON}
								width={BADGE_ICON}
							/>

							<Text style={styles.badgeLabel}>User Verified</Text>
						</View>
					) : null}
				</View>

				<View style={styles.caption}>
					<Text numberOfLines={1} style={styles.name}>
						{heading}
					</Text>

					{meta.length > 0 ? (
						<Text numberOfLines={1} style={styles.meta}>
							{meta}
						</Text>
					) : null}

					{role.length > 0 ? (
						<Text numberOfLines={1} style={styles.meta}>
							{role}
						</Text>
					) : null}
				</View>
			</Pressable>

			<Pressable
				accessibilityHint={
					canPress ? `Sends ${fullName} a connection request` : undefined
				}
				accessibilityLabel={`${CONNECT_LABEL[action]}, ${fullName}`}
				accessibilityRole="button"
				accessibilityState={{ disabled: !canPress, busy: action === "sending" }}
				disabled={!canPress}
				hitSlop={CONNECT_HIT_SLOP}
				onPress={() => onConnect(id)}
				style={({ pressed }) => [styles.connect, pressed && canPress && styles.pressed]}
			>
				<Text style={styles.connectLabel}>{CONNECT_LABEL[action]}</Text>
			</Pressable>
		</GradientFrame>
	);
});

const styles = StyleSheet.create({
	pressable: {
		flex: 1,
		justifyContent: "space-between",
		padding: Gap.card,
	},
	placeholder: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	initials: {
		...Type.profileName,
		color: Brand.purple,
	},
	scrim: {
		...MediaScrim,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		flexShrink: 1,
		gap: Spacing.one,
		paddingVertical: Spacing.half,
		paddingHorizontal: Gap.tight,
		borderRadius: Radius.pill,
		backgroundColor: Brand.purpleSoft,
	},
	badgeLabel: {
		...Type.badgeLabel,
		color: Brand.onBrand,
	},
	caption: {
		gap: Spacing.half,
		paddingBottom: CONNECT_MIN_HEIGHT + Gap.tight,
	},
	name: {
		...Type.cardName,
		color: Ink.onMedia,
	},
	meta: {
		...Type.cardMeta,
		color: Ink.onMediaMuted,
	},
	connect: {
		position: "absolute",
		left: Gap.card,
		right: Gap.card,
		bottom: Gap.card,
		minHeight: CONNECT_MIN_HEIGHT,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Radius.codeBox,
		backgroundColor: Ink.mediaControl,
	},
	connectLabel: {
		...Type.cardAction,
		color: Ink.onMedia,
	},
	pressed: {
		opacity: 0.7,
	},
});
