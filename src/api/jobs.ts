import type {
  Job,
  JobFormPayload,
  JobsListParams,
  JobsListResponse,
  MasterDataItem,
  MasterDataPayload,
  JobUpdatePayload,
  ScoringPreference,
  ScoringPreferencePayload,
} from "../types/job";

const viteEnv = (import.meta as { env?: { DEV?: boolean; VITE_API_BASE_URL?: string } }).env;
const API_BASE_URL = viteEnv?.VITE_API_BASE_URL ?? (viteEnv?.DEV ? "http://localhost:3000" : "");

type ApiErrorBody = {
  errors?: string[];
};

type MasterDataResource = {
  path: string;
  payloadKey: string;
};

const positionsResource: MasterDataResource = { path: "positions", payloadKey: "position" };
const locationsResource: MasterDataResource = { path: "locations", payloadKey: "location" };
const techStacksResource: MasterDataResource = { path: "tech_stacks", payloadKey: "tech_stack" };

export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(status: number, message: string, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

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

async function buildApiError(response: Response): Promise<ApiError> {
  const text = await response.text();
  let errors: string[] = [];

  if (text) {
    try {
      const body = JSON.parse(text) as ApiErrorBody;
      if (Array.isArray(body.errors)) {
        errors = body.errors.map((error) => String(error));
      }
    } catch {
      errors = [];
    }
  }

  const message = errors.length > 0
    ? errors.join(" / ")
    : `Request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`;

  return new ApiError(response.status, message, errors);
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const isFormDataBody = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const headers = isFormDataBody
    ? init?.headers
    : {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      };

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return (await response.json()) as T;
}

async function requestVoid(input: RequestInfo, init?: RequestInit): Promise<void> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw await buildApiError(response);
  }
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError && error.errors.length > 0) {
    return error.errors.join(" / ");
  }

  return fallbackMessage;
}

function hasJobFilePayload(job: JobFormPayload | JobUpdatePayload) {
  return Boolean(job.company_logo || job.remove_company_logo);
}

function buildJobFormData(job: JobFormPayload | JobUpdatePayload) {
  const formData = new FormData();

  Object.entries(job).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`job[${key}][]`, String(item)));
      return;
    }

    if (typeof File !== "undefined" && value instanceof File) {
      formData.append(`job[${key}]`, value);
      return;
    }

    formData.append(`job[${key}]`, value === true ? "1" : String(value));
  });

  return formData;
}

function buildJobRequestInit(method: "POST" | "PATCH", job: JobFormPayload | JobUpdatePayload): RequestInit {
  if (hasJobFilePayload(job)) {
    return {
      method,
      body: buildJobFormData(job),
    };
  }

  return {
    method,
    body: JSON.stringify({ job }),
  };
}

function masterDataUrl(resource: MasterDataResource, id?: number) {
  return `${API_BASE_URL}/api/${resource.path}${id ? `/${id}` : ""}`;
}

function fetchMasterData(resource: MasterDataResource): Promise<MasterDataItem[]> {
  return requestJson<MasterDataItem[]>(masterDataUrl(resource));
}

function createMasterData(resource: MasterDataResource, payload: MasterDataPayload): Promise<MasterDataItem> {
  return requestJson<MasterDataItem>(masterDataUrl(resource), {
    method: "POST",
    body: JSON.stringify({ [resource.payloadKey]: payload }),
  });
}

function updateMasterData(
  resource: MasterDataResource,
  id: number,
  payload: MasterDataPayload,
): Promise<MasterDataItem> {
  return requestJson<MasterDataItem>(masterDataUrl(resource, id), {
    method: "PATCH",
    body: JSON.stringify({ [resource.payloadKey]: payload }),
  });
}

function deleteMasterData(resource: MasterDataResource, id: number): Promise<void> {
  return requestVoid(masterDataUrl(resource, id), { method: "DELETE" });
}

export async function fetchJobs(params: JobsListParams = {}): Promise<JobsListResponse> {
  const query = buildQuery(params);
  return requestJson<JobsListResponse>(`${API_BASE_URL}/api/jobs${query}`);
}

export async function fetchJob(id: number): Promise<Job> {
  return requestJson<Job>(`${API_BASE_URL}/api/jobs/${id}`);
}

export async function createJob(job: JobFormPayload): Promise<Job> {
  return requestJson<Job>(`${API_BASE_URL}/api/jobs`, buildJobRequestInit("POST", job));
}

export async function updateJob(id: number, job: JobUpdatePayload): Promise<Job> {
  return requestJson<Job>(`${API_BASE_URL}/api/jobs/${id}`, buildJobRequestInit("PATCH", job));
}

export async function deleteJob(id: number): Promise<void> {
  return requestVoid(`${API_BASE_URL}/api/jobs/${id}`, { method: "DELETE" });
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

export async function fetchPositions(): Promise<MasterDataItem[]> {
  return fetchMasterData(positionsResource);
}

export async function fetchLocations(): Promise<MasterDataItem[]> {
  return fetchMasterData(locationsResource);
}

export async function createPosition(position: MasterDataPayload): Promise<MasterDataItem> {
  return createMasterData(positionsResource, position);
}

export async function createLocation(location: MasterDataPayload): Promise<MasterDataItem> {
  return createMasterData(locationsResource, location);
}

export async function updatePosition(id: number, position: MasterDataPayload): Promise<MasterDataItem> {
  return updateMasterData(positionsResource, id, position);
}

export async function updateLocation(id: number, location: MasterDataPayload): Promise<MasterDataItem> {
  return updateMasterData(locationsResource, id, location);
}

export async function deletePosition(id: number): Promise<void> {
  return deleteMasterData(positionsResource, id);
}

export async function deleteLocation(id: number): Promise<void> {
  return deleteMasterData(locationsResource, id);
}

export async function fetchTechStacks(): Promise<MasterDataItem[]> {
  return fetchMasterData(techStacksResource);
}

export async function createTechStack(techStack: MasterDataPayload): Promise<MasterDataItem> {
  return createMasterData(techStacksResource, techStack);
}

export async function updateTechStack(id: number, techStack: MasterDataPayload): Promise<MasterDataItem> {
  return updateMasterData(techStacksResource, id, techStack);
}

export async function deleteTechStack(id: number): Promise<void> {
  return deleteMasterData(techStacksResource, id);
}

export function buildJobsExportUrl(params: JobsListParams = {}): string {
  const query = buildQuery(params);
  return `${API_BASE_URL}/api/jobs/export${query}`;
}
