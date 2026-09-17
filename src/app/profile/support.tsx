import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MailIcon from "@/assets/settings/mail.svg";
import PhoneIcon from "@/assets/settings/phone.svg";
import HelpIcon from "@/assets/support/help-circle.svg";
import MessageCircleIcon from "@/assets/support/message-circle.svg";
import MessageIcon from "@/assets/support/message-filled.svg";
import SendIcon from "@/assets/support/send-rounded.svg";
import { ScreenHeader } from "@/components/nav/screen-header";
import { HelpSheet } from "@/components/support/help-sheet";
import { LiveChatSheet } from "@/components/support/live-chat-sheet";
import { MessagesSheet } from "@/components/support/messages-sheet";
import { ContactRow, SupportCard, SupportLinkRow } from "@/components/support/support-card";
import { Toast } from "@/components/ui/toast";
import {
	Brand,
	Gap,
	Ink,
	MaxColumnWidth,
	Spacing,
	SupportHeaderGradient,
	Type,
} from "@/constants/theme";
import {
	SUPPORT_EMAIL,
	SUPPORT_HOTLINE,
	SUPPORT_WHATSAPP,
	supportLinks,
} from "@/features/support/contacts";
import { useCurrentUser } from "@/features/user/use-current-user";

const EDGE_INSET = Spacing.three;

/** The frame's header is 410 of 852 points; the cards begin as the purple runs out. */
const HERO_TRIM = 130;
const HEADER_FRACTION = 0.46;
const HEADER_MIN_HEIGHT = 320;
const ILLUSTRATION = 128;
const ILLUSTRATION_OPACITY = 0.6;

type Sheet = "help" | "messages" | "chat" | null;

/**
 * Help & Support hub (Figma 3090:926). Help, Messages and Live Chat open as
 * sheets over this screen, as the frames draw them; the three contact rows
 * hand off to the mail, WhatsApp and phone apps.
 */
export default function SupportScreen() {
	const me = useCurrentUser();
	const insets = useSafeAreaInsets();
	const { height } = useWindowDimensions();
	const [sheet, setSheet] = useState<Sheet>(null);
	const [error, setError] = useState<string | null>(null);
	const goBack = useCallback(() => router.back(), []);
	const closeSheet = useCallback(() => setSheet(null), []);

	const open = useCallback(async (url: string) => {
		try {
			await Linking.openURL(url);
		} catch {
			setError("That app is not available on this phone.");
		}
	}, []);

	const firstName = me.data?.firstName ?? "there";
	const headerHeight = Math.max(height * HEADER_FRACTION, HEADER_MIN_HEIGHT);

	return (
		<View style={styles.screen}>
			<StatusBar style="light" />

			<View
				pointerEvents="none"
				style={[styles.header, { height: headerHeight + insets.top }]}
			/>

			<ScrollView
				contentContainerStyle={[
					styles.content,
					{
						paddingTop: insets.top + Spacing.two,
						paddingBottom: insets.bottom + Spacing.five,
					},
				]}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.column}>
					<ScreenHeader onBack={goBack} title="" tone="onBrand" />

					{error ? (
						<Toast message={error} onDismiss={() => setError(null)} tone="error" />
					) : null}

					<View style={[styles.hero, { minHeight: headerHeight - HERO_TRIM }]}>
						<Text accessibilityRole="header" style={styles.greeting}>
							Hello {firstName} 👋{"\n"}How can we help you today?
						</Text>

						<Image
							accessibilityIgnoresInvertColors
							contentFit="contain"
							source={require("@/assets/support/help-illustration.png")}
							style={styles.illustration}
						/>
					</View>

					<View style={styles.cards}>
						<SupportCard>
							<SupportLinkRow
								Icon={HelpIcon}
								label="Help"
								onPress={() => setSheet("help")}
							/>
							<SupportLinkRow
								Icon={MessageIcon}
								isLast
								label="Messages"
								onPress={() => setSheet("messages")}
							/>
						</SupportCard>

						<SupportCard>
							<SupportLinkRow
								Icon={SendIcon}
								isLast
								label="Live Chat"
								onPress={() => setSheet("chat")}
							/>
						</SupportCard>

						<SupportCard>
							<ContactRow
								Icon={MailIcon}
								caption="Email Support"
								onPress={() => void open(supportLinks.email())}
								value={SUPPORT_EMAIL}
							/>
							<ContactRow
								Icon={MessageCircleIcon}
								caption="WhatsApp Chat"
								onPress={() => void open(supportLinks.whatsapp())}
								value={SUPPORT_WHATSAPP}
							/>
							<ContactRow
								Icon={PhoneIcon}
								caption="Call Hotline"
								isLast
								onPress={() => void open(supportLinks.hotline())}
								value={SUPPORT_HOTLINE}
							/>
						</SupportCard>
					</View>
				</View>
			</ScrollView>

			<HelpSheet onDismiss={closeSheet} visible={sheet === "help"} />
			<MessagesSheet onDismiss={closeSheet} visible={sheet === "messages"} />
			<LiveChatSheet
				firstName={firstName}
				onDismiss={closeSheet}
				visible={sheet === "chat"}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	header: {
		...SupportHeaderGradient,
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
	},
	content: {
		flexGrow: 1,
	},
	column: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingHorizontal: EDGE_INSET,
		gap: Gap.card,
	},
	hero: {
		gap: Spacing.four,
		paddingTop: Spacing.two,
	},
	greeting: {
		...Type.successTitle,
		fontFamily: Type.cta.fontFamily,
		lineHeight: 30,
		color: Brand.onBrand,
	},
	illustration: {
		width: ILLUSTRATION,
		height: ILLUSTRATION,
		alignSelf: "center",
		opacity: ILLUSTRATION_OPACITY,
	},
	cards: {
		gap: Spacing.three,
		paddingTop: Spacing.two,
	},
});
