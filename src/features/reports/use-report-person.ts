import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { type PersonReport, reportPerson } from "./reports-service";

export function useReportPerson(): UseMutationResult<void, Error, PersonReport> {
	return useMutation({ mutationFn: reportPerson });
}
