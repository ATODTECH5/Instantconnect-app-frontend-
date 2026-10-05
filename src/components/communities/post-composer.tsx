import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import AttachImageIcon from "@/assets/chat/attach-image.svg";
import SendIcon from "@/assets/chat/send.svg";
import CloseIcon from "@/assets/search/close.svg";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const BUTTON = 50;
const AVATAR = 44;
const ICON = 22;
const PREVIEW = 64;

export type ComposerAttachment = { uri: string; uploading: boolean };

export type PostComposerProps = {
	placeholder: string;
	maxLength: number;
	viewer: { fullName: string; avatarUrl: string | null } | null;
	/** Shown above the field, such as "Replying to Marcus" with a way out. */
	context?: { label: string; onClear: () => void } | null;
	isSending: boolean;
	onSend: (body: string) => void;
	/** Omit where only text is allowed, such as comments. */
	attachment?: ComposerAttachment | null;
	onAttach?: () => void;
	onRemoveAttachment?: () => void;
};

/**
 * The feed's and the thread's composer. The design's voice note control is
 * left out: voice notes have no model on the server.
 */
export function PostComposer({
	placeholder,
	maxLength,
	viewer,
	context,
	isSending,
	onSend,
	attachment,
	onAttach,
	onRemoveAttachment,
}: PostComposerProps) {
	const [draft, setDraft] = useState("");
	const body = draft.trim();
	const attachmentReady = Boolean(attachment && !attachment.uploading);
	const canSend = !isSending && !attachment?.uploading && (body.length > 0 || attachmentReady);

	const send = () => {
		if (!canSend) return;

		onSend(body);
		setDraft("");
	};

	return (
		<View style={styles.wrap}>
			{context ? (
				<View style={styles.context}>
					<Text numberOfLines={1} style={styles.contextLabel}>
						{context.label}
					</Text>

					<Pressable
						accessibilityLabel="Cancel reply"
						accessibilityRole="button"
						hitSlop={Spacing.three}
						onPress={context.onClear}
					>
						<CloseIcon color={Ink.meta} height={16} width={16} />
					</Pressable>
				</View>
			) : null}

			{attachment ? (
				<View style={styles.preview}>
					<Image
						accessibilityIgnoresInvertColors
						contentFit="cover"
						source={{ uri: attachment.uri }}
						style={styles.previewImage}
					/>

					{attachment.uploading ? (
						<View style={styles.previewBusy}>
							<ActivityIndicator color={Brand.onBrand} />
						</View>
					) : null}

					<Pressable
						accessibilityLabel="Remove photo"
						accessibilityRole="button"
						hitSlop={Spacing.two}
						onPress={onRemoveAttachment}
						style={styles.previewRemove}
					>
						<CloseIcon color={Brand.onBrand} height={12} width={12} />
					</Pressable>
				</View>
			) : null}

			<View style={styles.row}>
				{viewer ? (
					<AvatarImage fullName={viewer.fullName} size={AVATAR} uri={viewer.avatarUrl} />
				) : null}

				<View style={styles.field}>
					<TextInput
						accessibilityLabel={placeholder}
						editable={!isSending}
						maxLength={maxLength}
						multiline
						onChangeText={setDraft}
						placeholder={placeholder}
						placeholderTextColor={Ink.placeholder}
						style={styles.input}
						value={draft}
					/>

					{onAttach ? (
						<Pressable
							accessibilityHint="Choose a photo to add to your post"
							accessibilityLabel="Add a photo"
							accessibilityRole="button"
							disabled={isSending}
							hitSlop={Spacing.two}
							onPress={onAttach}
							style={({ pressed }) => [styles.attach, pressed && styles.pressed]}
						>
							<AttachImageIcon color={Ink.meta} height={ICON} width={ICON} />
						</Pressable>
					) : null}
				</View>

				<Pressable
					accessibilityLabel="Send"
					accessibilityRole="button"
					accessibilityState={{ disabled: !canSend, busy: isSending }}
					disabled={!canSend}
					onPress={send}
					style={({ pressed }) => [
						styles.send,
						!canSend && styles.sendDisabled,
						pressed && styles.pressed,
					]}
				>
					{isSending ? (
						<ActivityIndicator color={Brand.onBrand} />
					) : (
						<SendIcon color={Brand.onBrand} height={ICON} width={ICON} />
					)}
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: {
		gap: Spacing.two,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Ink.border,
		backgroundColor: Ink.surface,
	},
	context: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
		paddingHorizontal: Spacing.two,
	},
	contextLabel: {
		...Type.cardMeta,
		flexShrink: 1,
		color: Brand.purple,
	},
	preview: {
		width: PREVIEW,
		height: PREVIEW,
	},
	previewImage: {
		width: PREVIEW,
		height: PREVIEW,
		borderRadius: Radius.control,
		backgroundColor: Ink.border,
	},
	previewBusy: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Radius.control,
		backgroundColor: Ink.mediaScrim,
	},
	previewRemove: {
		position: "absolute",
		top: -Spacing.two,
		right: -Spacing.two,
		width: 22,
		height: 22,
		borderRadius: 11,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Ink.title,
	},
	row: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: Spacing.two,
	},
	field: {
		flex: 1,
		flexDirection: "row",
		alignItems: "flex-end",
		minHeight: BUTTON,
		paddingLeft: Spacing.three,
		paddingRight: Spacing.two,
		borderRadius: Radius.sheet,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Ink.border,
		backgroundColor: Ink.surface,
	},
	input: {
		...Type.resultMeta,
		flex: 1,
		maxHeight: 120,
		paddingVertical: Gap.card + Spacing.one,
		color: Ink.body,
	},
	attach: {
		width: MinTapTarget - Spacing.two,
		height: BUTTON,
		alignItems: "center",
		justifyContent: "center",
	},
	send: {
		width: BUTTON,
		height: BUTTON,
		borderRadius: BUTTON / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purple,
	},
	sendDisabled: {
		opacity: 0.4,
	},
	pressed: {
		opacity: 0.7,
	},
});
