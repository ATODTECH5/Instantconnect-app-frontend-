import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import VerifiedSolidIcon from "@/assets/search/verified-solid.svg";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import type { ConnectionState } from "@/features/home/use-connect-requests";
import type { SearchPerson } from "@/features/search/search-catalog";
import { formatDistance } from "@/utils/format";

const AVATAR = 52;
const BADGE = 16;
const CONNECT_MIN_HEIGHT = 40;

const CONNECT_LABEL: Record<ConnectionState, string> = {
	idle: "Connect",
	pending: "Sending",
	sent: "Requested",
	failed: "Try again",
};

export type PersonRowProps = {
	person: SearchPerson;
	connectionState: ConnectionState;
	onOpen: (id: string) => void;
	onConnect: (id: string) => void;
};

/**
 * The list row form of a person. `home/person-card` is the photo backed grid
 * card and stays separate; the two share no layout.
 */
export const PersonRow = memo(function PersonRow({
	person,
	connectionState,
	onOpen,
	onConnect,
}: PersonRowProps) {
	const { id, name, age, category, distanceKm, photo, isVerified } = person;
	const meta = `${category} • ${formatDistance(distanceKm)}`;
	const isConnectInert = connectionState === "pending" || connectionState === "sent";

	return (
		<View style={styles.row}>
			<Pressable
				accessibilityHint="Opens this profile"
				accessibilityLabel={`${name}, ${age}. ${meta}${isVerified ? ". Verified" : ""}`}
				accessibilityRole="button"
				onPress={() => onOpen(id)}
				style={({ pressed }) => [styles.identity, pressed && styles.pressed]}
			>
				<Image
					accessibilityIgnoresInvertColors
					contentFit="cover"
					source={photo}
					style={styles.avatar}
					transition={200}
				/>

				<View style={styles.copy}>
					<View style={styles.nameRow}>
						<Text numberOfLines={1} style={styles.name}>
							{name}, {age}.
						</Text>

						{isVerified ? (
							<VerifiedSolidIcon color={Ink.verified} height={BADGE} width={BADGE} />
						) : null}
					</View>

					<Text numberOfLines={1} style={styles.meta}>
						{meta}
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
				onPress={() => onConnect(id)}
				style={({ pressed }) => [
					styles.connect,
					isConnectInert && styles.connectInert,
					pressed && !isConnectInert && styles.pressed,
				]}
			>
				<Text numberOfLines={1} style={styles.connectLabel}>
					{CONNECT_LABEL[connectionState]}
				</Text>
			</Pressable>
		</View>
	);
});

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget + Spacing.three,
	},
	identity: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
	},
	avatar: {
		width: AVATAR,
		height: AVATAR,
		borderRadius: AVATAR / 2,
		backgroundColor: Ink.border,
	},
	copy: {
		flex: 1,
		gap: Spacing.half,
	},
	nameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.tight,
	},
	name: {
		...Type.resultName,
		flexShrink: 1,
		color: Ink.title,
	},
	meta: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	connect: {
		minHeight: CONNECT_MIN_HEIGHT,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.control,
		borderWidth: 1,
		borderColor: Brand.purple,
		backgroundColor: Ink.surface,
	},
	connectInert: {
		borderColor: Ink.borderStrong,
	},
	connectLabel: {
		...Type.sectionLink,
		color: Brand.purple,
	},
	pressed: {
		opacity: 0.7,
	},
});
