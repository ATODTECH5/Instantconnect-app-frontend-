import { request } from "@/lib/api/api-client";

export type PersonReportReason =
	| "harassment"
	| "fake_profile"
	| "spam"
	| "inappropriate_content"
	| "safety_concern"
	| "underage"
	| "other";

export type ReportSource = "profile" | "chat";

export type PersonReport = {
	userId: string;
	reason: PersonReportReason;
	source: ReportSource;
	details?: string;
};

export function reportPerson(report: PersonReport): Promise<void> {
	return request("/reports/users", { method: "POST", body: report, auth: true });
}
