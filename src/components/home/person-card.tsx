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
import type { NearbyPerson } from "@/features/home/home-feed";
import type { ConnectionState } from "@/features/home/use-connect-requests";
import { formatDistance } from "@/utils/format";

export const PERSON_CARD_ASPECT = 171 / 212;

const BADGE_ICON = 12;
const DOT_SIZE = 8;
const DOT_RING = 1.5;
const CONNECT_MIN_HEIGHT = 32;
const CONNECT_HIT_SLOP = 8;

const CONNECT_LABEL: Record<ConnectionState, string> = {
	idle: "Connect",
	pending: "Sending",
	sent: "Requested",
	failed: "Try again",
};

export type PersonCardProps = {
	person: NearbyPerson;
	width: number;
	connectionState: ConnectionState;
	onOpen: (id: string) => void;
	onConnect: (id: string) => void;
};

export const PersonCard = memo(function PersonCard({
	person,
	width,
	connectionState,
	onOpen,
	onConnect,
}: PersonCardProps) {
	const { id, name, age, category, role, distanceKm, photo, isVerified, isOnline } = person;
	const meta = `${category} • ${formatDistance(distanceKm)}`;
	const isConnectInert = connectionState === "pending" || connectionState === "sent";

	return (
		<GradientFrame radius={Radius.media} style={{ width, aspectRatio: PERSON_CARD_ASPECT }}>
			<Pressable
				accessibilityHint="Opens this profile"
				accessibilityLabel={`${name}, ${age}. ${meta}. ${role}${isVerified ? ". Verified" : ""}`}
				accessibilityRole="button"
				onPress={() => onOpen(id)}
				style={styles.pressable}
			>
				<Image
					accessibilityIgnoresInvertColors
					contentFit="cover"
					source={photo}
					style={AbsoluteFill}
					transition={200}
				/>

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
					) : (
						<View />
					)}

					{isOnline ? <View style={styles.dot} /> : null}
				</View>

				<View style={styles.caption}>
					<Text numberOfLines={1} style={styles.name}>
						{name}, {age}
					</Text>

					<Text numberOfLines={1} style={styles.meta}>
						{meta}
					</Text>

					<Text numberOfLines={1} style={styles.meta}>
						{role}
					</Text>
				</View>
			</Pressable>

			<Pressable
				accessibilityHint={`Sends ${name} a connection request`}
				accessibilityLabel={`${CONNECT_LABEL[connectionState]}, ${name}`}
				accessibilityRole="button"
				accessibilityState={{
					disabled: isConnectInert,
					busy: connectionState === "pending",
				}}
				disabled={isConnectInert}
				hitSlop={CONNECT_HIT_SLOP}
				onPress={() => onConnect(id)}
				style={({ pressed }) => [
					styles.connect,
					pressed && !isConnectInert && styles.pressed,
				]}
			>
				<Text style={styles.connectLabel}>{CONNECT_LABEL[connectionState]}</Text>
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
	dot: {
		width: DOT_SIZE,
		height: DOT_SIZE,
		borderRadius: DOT_SIZE / 2,
		backgroundColor: Ink.online,
		borderWidth: DOT_RING,
		borderColor: Ink.surface,
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
