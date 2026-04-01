import type {
  Job,
  JobFormPayload,
  JobsListParams,
  JobsListResponse,
  JobUpdatePayload,
  ScoringPreference,
  ScoringPreferencePayload,
} from "../types/job";

const API_BASE_URL = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env
  ?.VITE_API_BASE_URL ?? "http://localhost:3000";

function buildQuery(params: JobsListParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.status?.length) searchParams.set("status", params.status.join(","));
  if (params.work_style?.length) {
    searchParams.set("work_style", params.work_style.join(","));
  }
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.direction) searchParams.set("direction", params.direction);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.per_page) searchParams.set("per_page", String(params.per_page));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
  }

  return (await response.json()) as T;
}

export async function fetchJobs(params: JobsListParams = {}): Promise<JobsListResponse> {
  const query = buildQuery(params);
  return requestJson<JobsListResponse>(`${API_BASE_URL}/api/jobs${query}`);
}

export async function fetchJob(id: number): Promise<Job> {
  return requestJson<Job>(`${API_BASE_URL}/api/jobs/${id}`);
}

export async function createJob(job: JobFormPayload): Promise<Job> {
  return requestJson<Job>(`${API_BASE_URL}/api/jobs`, {
    method: "POST",
    body: JSON.stringify({ job }),
  });
}

export async function updateJob(id: number, job: JobUpdatePayload): Promise<Job> {
  return requestJson<Job>(`${API_BASE_URL}/api/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ job }),
  });
}

export async function deleteJob(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
  }
}

export async function fetchScoringPreference(): Promise<ScoringPreference> {
  return requestJson<ScoringPreference>(`${API_BASE_URL}/api/scoring_preference`);
}

export async function updateScoringPreference(
  scoringPreference: ScoringPreferencePayload,
): Promise<ScoringPreference> {
  return requestJson<ScoringPreference>(`${API_BASE_URL}/api/scoring_preference`, {
    method: "PATCH",
    body: JSON.stringify({ scoring_preference: scoringPreference }),
  });
}

export function buildJobsExportUrl(params: JobsListParams = {}): string {
  const query = buildQuery(params);
  return `${API_BASE_URL}/api/jobs/export${query}`;
}
