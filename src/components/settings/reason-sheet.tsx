import {
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

import { Brand, Gap, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import { type DeletionReason, DELETION_REASONS } from "@/lib/api/settings-schema";

const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 4;
const RADIO_SIZE = 18;
const DETAILS_HEIGHT = 64;
const DETAILS_MAX_LENGTH = 1000;

export type ReasonSheetProps = {
	visible: boolean;
	reason: DeletionReason | null;
	details: string;
	onChangeReason: (reason: DeletionReason) => void;
	onChangeDetails: (details: string) => void;
	onSubmit: () => void;
	onDismiss: () => void;
	isSubmitting: boolean;
};

/**
 * The reason sheet on Settings / Delete Account (Figma 3075:2930). Its own
 * sheet rather than `BottomSheet`, which centres a title and a badge; this
 * one is a left-aligned form with radio rows and a text box.
 */
export function ReasonSheet({
	visible,
	reason,
	details,
	onChangeReason,
	onChangeDetails,
	onSubmit,
	onDismiss,
	isSubmitting,
}: ReasonSheetProps) {
	return (
		<Modal
			animationType="slide"
			onRequestClose={onDismiss}
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.scrim}
			>
				<Pressable
					accessibilityLabel="Dismiss"
					accessibilityRole="button"
					onPress={onDismiss}
					style={styles.backdrop}
				/>

				<View accessibilityViewIsModal style={styles.sheet}>
					<View style={styles.handle} />

					<View style={styles.heading}>
						<Text accessibilityRole="header" style={styles.title}>
							Reason
						</Text>

						<Text style={styles.subtitle}>Why are you leaving?</Text>
					</View>

					<ScrollView keyboardShouldPersistTaps="handled" style={styles.scroll}>
						<View accessibilityRole="radiogroup">
							{DELETION_REASONS.map((option) => {
								const selected = option.id === reason;

								return (
									<Pressable
										accessibilityLabel={option.label}
										accessibilityRole="radio"
										accessibilityState={{ checked: selected }}
										key={option.id}
										onPress={() => onChangeReason(option.id)}
										style={({ pressed }) => [
											styles.option,
											pressed && styles.pressed,
										]}
									>
										<Text style={styles.optionLabel}>{option.label}</Text>

										<View
											style={[styles.radio, selected && styles.radioSelected]}
										>
											{selected ? <View style={styles.radioDot} /> : null}
										</View>
									</Pressable>
								);
							})}
						</View>

						<TextInput
							accessibilityLabel="Additional details"
							editable={!isSubmitting}
							maxLength={DETAILS_MAX_LENGTH}
							multiline
							onChangeText={onChangeDetails}
							placeholder="Add additional details..."
							placeholderTextColor={Ink.meta}
							style={styles.details}
							textAlignVertical="top"
							value={details}
						/>
					</ScrollView>

					<Pressable
						accessibilityLabel="Ok"
						accessibilityRole="button"
						accessibilityState={{ disabled: reason === null || isSubmitting }}
						disabled={reason === null || isSubmitting}
						onPress={onSubmit}
						style={({ pressed }) => [
							styles.submit,
							(reason === null || isSubmitting) && styles.submitDisabled,
							pressed && styles.pressed,
						]}
					>
						<Text style={styles.submitLabel}>{isSubmitting ? "Sending…" : "Ok"}</Text>
					</Pressable>

					<Text style={styles.footnote}>
						InstantConnect is here to help you connect better
					</Text>
				</View>
			</KeyboardAvoidingView>
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
		maxHeight: "85%",
		alignSelf: "center",
		gap: Spacing.three,
		padding: Gap.section,
		paddingBottom: Spacing.five,
		borderTopLeftRadius: Radius.sheet,
		borderTopRightRadius: Radius.sheet,
		backgroundColor: Ink.surface,
	},
	handle: {
		width: HANDLE_WIDTH,
		height: HANDLE_HEIGHT,
		borderRadius: HANDLE_HEIGHT / 2,
		alignSelf: "center",
		backgroundColor: Ink.bubbleIncoming,
	},
	heading: {
		gap: Spacing.one,
	},
	title: {
		...Type.subtitle,
		color: Ink.title,
	},
	subtitle: {
		...Type.promoBody,
		color: Ink.meta,
	},
	scroll: {
		flexGrow: 0,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.card,
		paddingVertical: Gap.card,
		borderBottomWidth: 1,
		borderBottomColor: Ink.bubbleIncoming,
	},
	optionLabel: {
		...Type.profileMeta,
		fontFamily: Type.action.fontFamily,
		flexShrink: 1,
		color: Ink.title,
	},
	radio: {
		width: RADIO_SIZE,
		height: RADIO_SIZE,
		borderRadius: RADIO_SIZE / 2,
		borderWidth: 1,
		borderColor: Ink.borderStrong,
		alignItems: "center",
		justifyContent: "center",
	},
	radioSelected: {
		borderColor: Brand.purple,
	},
	radioDot: {
		width: RADIO_SIZE / 2,
		height: RADIO_SIZE / 2,
		borderRadius: RADIO_SIZE / 4,
		backgroundColor: Brand.purple,
	},
	details: {
		...Type.promoBody,
		minHeight: DETAILS_HEIGHT,
		marginTop: Spacing.three,
		padding: Gap.card,
		borderWidth: 1,
		borderColor: Ink.bubbleIncoming,
		borderRadius: Radius.control,
		backgroundColor: Ink.keypad,
		color: Ink.title,
	},
	submit: {
		minHeight: 48,
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.three - Spacing.half,
		borderRadius: Radius.control,
		backgroundColor: Ink.danger,
	},
	submitDisabled: {
		opacity: 0.45,
	},
	submitLabel: {
		...Type.cta,
		color: Brand.onBrand,
	},
	footnote: {
		...Type.badgeLabel,
		fontFamily: Type.footnote.fontFamily,
		color: Ink.meta,
		textAlign: "center",
	},
	pressed: {
		opacity: 0.7,
	},
});
