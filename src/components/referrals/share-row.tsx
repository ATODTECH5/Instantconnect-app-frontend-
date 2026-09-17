import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import InstagramIcon from "@/assets/referrals/instagram.svg";
import LinkIcon from "@/assets/referrals/link.svg";
import MessageIcon from "@/assets/referrals/message-square.svg";
import WhatsAppIcon from "@/assets/referrals/whatsapp.svg";
import XIcon from "@/assets/referrals/x.svg";
import { Brand, BrandGradient, Gap, Ink, Radius, Social, Spacing, Type } from "@/constants/theme";
import type { ShareTarget } from "@/features/referrals/share-invite";

const DISC = 48;
const ICON = 22;

type Entry = {
	id: ShareTarget | "link";
	label: string;
	Icon: FC<SvgProps>;
	tint: string;
};

const ENTRIES: Entry[] = [
	{ id: "message", label: "Message", Icon: MessageIcon, tint: Brand.onBrand },
	{ id: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon, tint: Brand.onBrand },
	{ id: "instagram", label: "Instagram", Icon: InstagramIcon, tint: Brand.onBrand },
	{ id: "x", label: "X / Twitter", Icon: XIcon, tint: Brand.onBrand },
	{ id: "link", label: "Copy Link", Icon: LinkIcon, tint: Brand.purple },
];

export type ShareRowProps = {
	onShare: (target: ShareTarget) => void;
	onCopyLink: () => void;
};

/** "Share via" (Figma 3051:1453): four apps and a copy link control. */
export function ShareRow({ onShare, onCopyLink }: ShareRowProps) {
	return (
		<View style={styles.card}>
			<Text style={styles.heading}>Share via</Text>

			<View style={styles.row}>
				{ENTRIES.map(({ id, label, Icon, tint }) => (
					<Pressable
						accessibilityLabel={id === "link" ? "Copy invite link" : `Share via ${label}`}
						accessibilityRole="button"
						key={id}
						onPress={() => (id === "link" ? onCopyLink() : onShare(id))}
						style={({ pressed }) => [styles.item, pressed && styles.pressed]}
					>
						<View style={[styles.disc, DISC_STYLE[id]]}>
							<Icon color={tint} height={ICON} width={ICON} />
						</View>

						<Text numberOfLines={1} style={styles.label}>
							{label}
						</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: Gap.card,
		padding: Gap.card,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.keypad,
	},
	heading: {
		...Type.docSection,
		color: Ink.title,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	item: {
		flex: 1,
		alignItems: "center",
		gap: Spacing.two,
	},
	disc: {
		width: DISC,
		height: DISC,
		borderRadius: DISC / 2,
		alignItems: "center",
		justifyContent: "center",
	},
	message: {
		backgroundColor: Social.message,
	},
	whatsapp: {
		backgroundColor: Social.whatsapp,
	},
	instagram: {
		...BrandGradient,
	},
	x: {
		backgroundColor: Social.x,
	},
	link: {
		borderWidth: 1,
		borderColor: Brand.purpleTint,
		backgroundColor: Brand.purpleSurfaceSubtle,
	},
	label: {
		...Type.cardMeta,
		fontFamily: Type.action.fontFamily,
		color: Ink.muted,
		textAlign: "center",
	},
	pressed: {
		opacity: 0.7,
	},
});

const DISC_STYLE: Record<Entry["id"], object> = {
	message: styles.message,
	whatsapp: styles.whatsapp,
	instagram: styles.instagram,
	x: styles.x,
	link: styles.link,
};
