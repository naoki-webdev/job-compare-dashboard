import type { JobDraftRequest, JobDraftResponse } from "../types/job";
import { API_BASE_URL, requestJson } from "./client";

export async function createJobDraft(payload: JobDraftRequest): Promise<JobDraftResponse> {
  return requestJson<JobDraftResponse>(`${API_BASE_URL}/api/job_drafts`, {
    method: "POST",
    body: JSON.stringify({ job_draft: payload }),
  });
}
