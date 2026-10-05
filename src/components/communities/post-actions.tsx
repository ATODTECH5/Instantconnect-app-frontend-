import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import BellOffIcon from "@/assets/communities/bell-off.svg";
import EditIcon from "@/assets/communities/edit.svg";
import FlagIcon from "@/assets/communities/flag.svg";
import PinIcon from "@/assets/communities/pin.svg";
import TrashIcon from "@/assets/profile/trash.svg";
import LinkIcon from "@/assets/referrals/link.svg";
import { ReasonSheet } from "@/components/settings/reason-sheet";
import { ActionSheet, type ActionSheetItem } from "@/components/ui/action-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StackedTextField } from "@/components/ui/stacked-field";
import { TallSheet } from "@/components/ui/tall-sheet";
import { Toast } from "@/components/ui/toast";
import { Gap, Ink, Type } from "@/constants/theme";
import { postLink } from "@/features/communities/community-links";
import type { ReportReason } from "@/features/communities/community-service";
import {
	useDeletePost,
	useEditPost,
	useReportPost,
	useTogglePost,
} from "@/features/communities/use-communities";
import { describeError } from "@/lib/api/api-error";
import { copyToClipboard } from "@/utils/clipboard";
import type { ApiCommunityPost } from "@/lib/api/community-schema";

const POST_MAX = 2000;

const REPORT_REASONS: readonly { id: ReportReason; label: string }[] = [
	{ id: "spam", label: "Spam" },
	{ id: "harassment", label: "Harassment or bullying" },
	{ id: "misinformation", label: "Misinformation" },
	{ id: "hate_speech", label: "Hate speech" },
	{ id: "violence", label: "Violence or threats" },
	{ id: "sexual_content", label: "Nudity or sexual content" },
	{ id: "other", label: "Other" },
];

type Overlay = "none" | "menu" | "edit" | "delete" | "report";

export type PostActionsProps = {
	post: ApiCommunityPost | null;
	communityId: string;
	onClose: () => void;
	/** After a delete, so a thread screen can leave. */
	onDeleted?: () => void;
};

/**
 * The "..." sheet for a post and everything it leads to. Rows come from the
 * post's own permissions, so nobody is offered an action the server refuses.
 */
export function PostActions({ post, communityId, onClose, onDeleted }: PostActionsProps) {
	const [overlay, setOverlay] = useState<Overlay>("menu");
	const [shownFor, setShownFor] = useState<string | null>(null);
	const [draft, setDraft] = useState("");
	const [reason, setReason] = useState<ReportReason | null>(null);
	const [details, setDetails] = useState("");
	const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

	const toggle = useTogglePost();
	const edit = useEditPost();
	const remove = useDeletePost(communityId);
	const report = useReportPost();

	// A new target starts from the menu with a clean report form.
	if (post && post.id !== shownFor) {
		setShownFor(post.id);
		setOverlay("menu");
		setDraft(post.body ?? "");
		setReason(null);
		setDetails("");
	}

	const close = () => {
		setOverlay("none");
		setShownFor(null);
		onClose();
	};

	const fail = (cause: unknown) => setToast({ message: describeError(cause), tone: "error" });

	const items: ActionSheetItem[] = post
		? [
				...(post.viewer.canPin
					? [
							{
								key: "pin",
								label: post.isPinned ? "Unpin Post" : "Pin Post",
								Icon: PinIcon,
								onPress: () => {
									toggle.mutate(
										{ postId: post.id, action: "pin", on: !post.isPinned },
										{ onError: fail },
									);
									close();
								},
							},
						]
					: []),
				...(post.viewer.canEdit && post.body !== null
					? [
							{
								key: "edit",
								label: "Edit Post",
								Icon: EditIcon,
								onPress: () => setOverlay("edit"),
							},
						]
					: []),
				{
					key: "link",
					label: "Copy Link",
					Icon: LinkIcon,
					onPress: () => {
						copyToClipboard(postLink(post.id));
						close();
						setToast({ message: "Link copied.", tone: "success" });
					},
				},
				{
					key: "mute",
					label: post.viewer.isMuted ? "Unmute Post" : "Mute Post",
					Icon: BellOffIcon,
					onPress: () => {
						toggle.mutate(
							{ postId: post.id, action: "mute", on: !post.viewer.isMuted },
							{
								onSuccess: (updated) =>
									setToast({
										message: updated.viewer.isMuted
											? "You won't be notified about this post."
											: "Notifications for this post are back on.",
										tone: "success",
									}),
								onError: fail,
							},
						);
						close();
					},
				},
				...(post.viewer.canReport
					? [
							{
								key: "report",
								label: "Report Post",
								Icon: FlagIcon,
								destructive: true,
								onPress: () => setOverlay("report"),
							},
						]
					: []),
				...(post.viewer.canDelete
					? [
							{
								key: "delete",
								label: "Delete Post",
								Icon: TrashIcon,
								destructive: true,
								onPress: () => setOverlay("delete"),
							},
						]
					: []),
			]
		: [];

	return (
		<>
			<ActionSheet
				items={items}
				onDismiss={close}
				visible={Boolean(post) && overlay === "menu"}
			/>

			<TallSheet
				onDismiss={close}
				title="Edit Post"
				visible={Boolean(post) && overlay === "edit"}
			>
				<View style={styles.edit}>
					<StackedTextField
						autoFocus
						label="Post"
						maxLength={POST_MAX}
						multiline
						onChangeText={setDraft}
						value={draft}
					/>

					{edit.isError ? (
						<Text style={styles.error}>{describeError(edit.error)}</Text>
					) : null}

					<PrimaryButton
						disabled={!draft.trim()}
						label="Save"
						loading={edit.isPending}
						onPress={() => {
							if (!post) return;
							edit.mutate(
								{ postId: post.id, body: draft.trim() },
								{ onSuccess: close },
							);
						}}
					/>
				</View>
			</TallSheet>

			<ConfirmDialog
				cancelLabel="Keep Post"
				confirmLabel="Delete"
				message="It will be removed for everyone, with its comments."
				onCancel={close}
				onConfirm={() => {
					if (!post) return;
					remove.mutate(post.id, {
						onSuccess: () => {
							close();
							onDeleted?.();
						},
						onError: (cause) => {
							close();
							fail(cause);
						},
					});
				}}
				title="Delete this post?"
				visible={Boolean(post) && overlay === "delete"}
			/>

			<ReasonSheet
				details={details}
				footnote="Reports are anonymous and reviewed by our safety team"
				isSubmitting={report.isPending}
				onChangeDetails={setDetails}
				onChangeReason={setReason}
				onDismiss={() => {
					if (!report.isPending) close();
				}}
				onSubmit={() => {
					if (!post || !reason) return;
					report.mutate(
						{ postId: post.id, reason, details: details.trim() || undefined },
						{
							onSuccess: () => {
								close();
								setToast({
									message: "Thanks. Our safety team will review this post.",
									tone: "success",
								});
							},
							onError: (cause) => {
								close();
								fail(cause);
							},
						},
					);
				}}
				options={REPORT_REASONS}
				reason={reason}
				submitLabel="Submit Report"
				subtitle="Why are you reporting this post?"
				title="Report Post"
				visible={Boolean(post) && overlay === "report"}
			/>

			{toast ? (
				<Toast message={toast.message} onDismiss={() => setToast(null)} tone={toast.tone} />
			) : null}
		</>
	);
}

const styles = StyleSheet.create({
	edit: {
		gap: Gap.section,
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
	},
});
