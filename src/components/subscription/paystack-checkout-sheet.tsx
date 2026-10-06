import { useState } from "react";
import {
	Linking,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, type WebViewNavigation } from "react-native-webview";

import CloseIcon from "@/assets/search/close.svg";
import LockIcon from "@/assets/subscription/lock.svg";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { Ink, MaxColumnWidth, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 4;
const LOCK_SIZE = 14;
const CLOSE_SIZE = 20;
/** Leaves a strip of the plan screen showing above, so it reads as a sheet. */
const SHEET_HEIGHT_RATIO = 0.9;

/** The server sets this as Paystack's cancel_action, so Cancel Payment lands here. */
const PAYSTACK_CLOSE_URL = "https://standard.paystack.co/close";

export type PaystackCheckoutSheetProps = {
	/** Paystack's hosted checkout page; null keeps the sheet closed. */
	authorizationUrl: string | null;
	/** Paystack redirects here once the charge settles, paid or failed. */
	callbackUrl: string;
	/** Paystack finished: the server has the verdict. */
	onFinished: () => void;
	/** The member closed the sheet, or cancelled on Paystack's page. */
	onClose: () => void;
};

/**
 * Paystack's checkout inside the app, in a sheet that slides over the plan
 * screen the way Paystack's web popup sits over a page. The page is
 * Paystack's: card details go straight to Paystack and never reach the app.
 * The sheet only watches where the page navigates, to know when it is done.
 */
export function PaystackCheckoutSheet({
	authorizationUrl,
	callbackUrl,
	onFinished,
	onClose,
}: PaystackCheckoutSheetProps) {
	const insets = useSafeAreaInsets();
	const { height } = useWindowDimensions();
	const [isLoading, setIsLoading] = useState(true);

	const shouldLoad = (request: WebViewNavigation) => {
		const { url } = request;

		if (url.startsWith(callbackUrl)) {
			onFinished();
			return false;
		}

		if (url.startsWith(PAYSTACK_CLOSE_URL)) {
			onClose();
			return false;
		}

		// Bank and USSD options can hand off to another app or the dialler.
		if (!url.startsWith("http") && url !== "about:blank") {
			void Linking.openURL(url).catch(() => undefined);
			return false;
		}

		return true;
	};

	return (
		<Modal
			animationType="slide"
			onRequestClose={onClose}
			onShow={() => setIsLoading(true)}
			statusBarTranslucent
			transparent
			visible={authorizationUrl !== null}
		>
			<View style={styles.scrim}>
				<Pressable
					accessibilityLabel="Close checkout"
					accessibilityRole="button"
					onPress={onClose}
					style={styles.backdrop}
				/>

				<View
					accessibilityViewIsModal
					style={[
						styles.sheet,
						{ height: height * SHEET_HEIGHT_RATIO, paddingBottom: insets.bottom },
					]}
				>
					<View style={styles.handle} />

					<View style={styles.header}>
						<View style={styles.titleRow}>
							<LockIcon color={Ink.meta} height={LOCK_SIZE} width={LOCK_SIZE} />

							<Text accessibilityRole="header" style={styles.title}>
								Secure checkout
							</Text>
						</View>

						<Pressable
							accessibilityLabel="Close checkout"
							accessibilityRole="button"
							hitSlop={Spacing.two}
							onPress={onClose}
							style={styles.close}
						>
							<CloseIcon color={Ink.meta} height={CLOSE_SIZE} width={CLOSE_SIZE} />
						</Pressable>
					</View>

					<View style={styles.body}>
						{authorizationUrl ? (
							<WebView
								onLoadEnd={() => setIsLoading(false)}
								onShouldStartLoadWithRequest={shouldLoad}
								originWhitelist={["*"]}
								setSupportMultipleWindows={false}
								source={{ uri: authorizationUrl }}
								style={styles.webView}
							/>
						) : null}

						{isLoading ? (
							<View style={styles.loader}>
								<GradientSpinner />
							</View>
						) : null}
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	scrim: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: Ink.scrim,
	},
	backdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sheet: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
		paddingTop: Spacing.two,
		borderTopLeftRadius: Radius.sheet,
		borderTopRightRadius: Radius.sheet,
		overflow: "hidden",
		backgroundColor: Ink.surface,
	},
	handle: {
		width: HANDLE_WIDTH,
		height: HANDLE_HEIGHT,
		alignSelf: "center",
		borderRadius: HANDLE_HEIGHT / 2,
		backgroundColor: Ink.border,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingLeft: Spacing.three,
		paddingRight: Spacing.two,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Ink.border,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
	title: {
		...Type.featureTitle,
		color: Ink.title,
	},
	close: {
		width: MinTapTarget,
		height: MinTapTarget,
		alignItems: "center",
		justifyContent: "center",
	},
	body: {
		flex: 1,
	},
	webView: {
		flex: 1,
		backgroundColor: Ink.surface,
	},
	loader: {
		...StyleSheet.absoluteFill,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.surface,
	},
});
