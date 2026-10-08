import { useState } from "react";

import { ReasonSheet } from "@/components/settings/reason-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { useBlockAction } from "@/features/blocks/use-blocks";
import type { PersonReportReason, ReportSource } from "@/features/reports/reports-service";
import { useReportPerson } from "@/features/reports/use-report-person";
import { describeError } from "@/lib/api/api-error";

const REASONS: readonly { id: PersonReportReason; label: string }[] = [
	{ id: "harassment", label: "Harassment or bullying" },
	{ id: "safety_concern", label: "Made me feel unsafe" },
	{ id: "fake_profile", label: "Fake profile or impersonation" },
	{ id: "inappropriate_content", label: "Inappropriate messages or photos" },
	{ id: "spam", label: "Spam or scam" },
	{ id: "underage", label: "May be under 18" },
	{ id: "other", label: "Other" },
];

type Stage = "reason" | "offerBlock" | "closed";

export type ReportPersonFlowProps = {
	visible: boolean;
	person: { id: string; fullName: string };
	source: ReportSource;
	onClose: () => void;
	/** The person was also blocked, so the screen showing them should leave. */
	onBlocked: () => void;
};

/**
 * Report a member, then offer to block them too: a report goes to the safety
 * team, but only a block stops them reaching you in the meantime.
 */
export function ReportPersonFlow({
	visible,
	person,
	source,
	onClose,
	onBlocked,
}: ReportPersonFlowProps) {
	const firstName = person.fullName.split(" ")[0] || "this person";
	const report = useReportPerson();
	const block = useBlockAction();
	const [stage, setStage] = useState<Stage>("reason");
	const [reason, setReason] = useState<PersonReportReason | null>(null);
	const [details, setDetails] = useState("");
	const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

	const finish = () => {
		setStage("reason");
		setReason(null);
		setDetails("");
		onClose();
	};

	return (
		<>
			<ReasonSheet
				details={details}
				footnote={`${firstName} won't know who reported them. Our safety team reviews every report.`}
				isSubmitting={report.isPending}
				onChangeDetails={setDetails}
				onChangeReason={setReason}
				onDismiss={() => {
					if (!report.isPending) finish();
				}}
				onSubmit={() => {
					if (!reason) return;
					report.mutate(
						{ userId: person.id, reason, source, details: details.trim() || undefined },
						{
							onSuccess: () => setStage("offerBlock"),
							onError: (cause) => {
								finish();
								setToast({ message: describeError(cause), tone: "error" });
							},
						},
					);
				}}
				options={REASONS}
				reason={reason}
				submitLabel="Submit Report"
				subtitle={`Why are you reporting ${firstName}?`}
				title={`Report ${firstName}`}
				visible={visible && stage === "reason"}
			/>

			<ConfirmDialog
				cancelLabel="Not Now"
				confirmLabel="Block"
				message={`Thanks, we'll review your report. Blocking ${firstName} also stops them seeing your profile or messaging you.`}
				onCancel={() => {
					finish();
					setToast({ message: "Report sent to our safety team.", tone: "success" });
				}}
				onConfirm={() => {
					block.mutate(
						{ type: "block", userId: person.id },
						{
							onSuccess: () => {
								finish();
								onBlocked();
							},
							onError: (cause) => {
								finish();
								setToast({ message: describeError(cause), tone: "error" });
							},
						},
					);
				}}
				title={`Block ${firstName} too?`}
				visible={visible && stage === "offerBlock"}
			/>

			{toast ? (
				<Toast message={toast.message} onDismiss={() => setToast(null)} tone={toast.tone} />
			) : null}
		</>
	);
}
