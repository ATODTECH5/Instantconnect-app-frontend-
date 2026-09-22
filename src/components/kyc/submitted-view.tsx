import { StyleSheet, Text, View } from "react-native";

import { Timeline } from "@/components/kyc/timeline";
import { PaymentSuccessBadge } from "@/components/subscription/payment-success-badge";
import { Ink, Radius, Spacing, Type } from "@/constants/theme";

/**
 * The Verification Submitted frame, which is also what the hub shows while
 * a submission is pending: the copy promises a review, and that is exactly
 * the state the account is in until an admin decides.
 */
export function SubmittedView() {
	return (
		<View style={styles.body}>
			<PaymentSuccessBadge />

			<View style={styles.titles}>
				<Text accessibilityRole="header" style={styles.title}>
					Verification Submitted
				</Text>
				<Text style={styles.subtitle}>
					Thank you! Your details have been securely uploaded. Our team is reviewing your
					documents.
				</Text>
			</View>

			<View style={styles.card}>
				<Timeline
					header={<Text style={styles.cardTitle}>What happens next?</Text>}
					items={[
						{
							key: "uploaded",
							title: "Documents Uploaded",
							body: "Your ID and selfie were received successfully.",
							tone: "done",
						},
						{
							key: "review",
							title: "Processing Check",
							body: "Usually takes less than 30 minutes.",
							tone: "current",
						},
						{
							key: "activated",
							title: "Account Activated",
							body: "We will notify you the moment it is done.",
							tone: "todo",
						},
					]}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	body: {
		gap: Spacing.four,
		paddingTop: Spacing.four,
	},
	titles: {
		gap: Spacing.two,
		alignItems: "center",
	},
	title: {
		...Type.successTitle,
		textAlign: "center",
		color: Ink.title,
	},
	subtitle: {
		...Type.successBody,
		textAlign: "center",
		color: Ink.muted,
	},
	card: {
		padding: Spacing.three,
		borderWidth: 1,
		borderColor: Ink.border,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.surface,
	},
	cardTitle: {
		...Type.sectionTitle,
		marginBottom: Spacing.three,
		color: Ink.title,
	},
});
