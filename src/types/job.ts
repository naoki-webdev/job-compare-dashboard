export type JobStatus =
  | "interested"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export type WorkStyle = "full_remote" | "hybrid" | "onsite";

export type EmploymentType = "full_time" | "contract";
export type JobSortKey =
  | "company_name"
  | "position"
  | "status"
  | "work_style"
  | "salary_max"
  | "score"
  | "updated_at";

export type SortDirection = "asc" | "desc";

export type Job = {
  id: number;
  company_name: string;
  position: string;
  status: JobStatus;
  work_style: WorkStyle;
  employment_type: EmploymentType;
  salary_min: number;
  salary_max: number;
  tech_stack: string;
  location: string;
  notes: string;
  score: number;
  created_at: string;
  updated_at: string;
};

export type JobsListMeta = {
  page: number;
  per_page: number;
  total_count: number;
};

export type JobsListResponse = {
  jobs: Job[];
  meta: JobsListMeta;
};

export type ScoringPreference = {
  id: number;
  full_remote_weight: number;
  hybrid_weight: number;
  onsite_weight: number;
  rails_weight: number;
  typescript_weight: number;
  high_salary_max_threshold: number;
  high_salary_bonus: number;
  low_salary_min_threshold: number;
  low_salary_penalty: number;
  created_at: string;
  updated_at: string;
};

export type ScoringPreferencePayload = Omit<ScoringPreference, "id" | "created_at" | "updated_at">;

export type JobFormPayload = Pick<
  Job,
  | "company_name"
  | "position"
  | "status"
  | "work_style"
  | "employment_type"
  | "salary_min"
  | "salary_max"
  | "tech_stack"
  | "location"
  | "notes"
>;

export type JobsListParams = {
  keyword?: string;
  status?: JobStatus[];
  work_style?: WorkStyle[];
  sort?: JobSortKey;
  direction?: SortDirection;
  page?: number;
  per_page?: number;
};

export type JobUpdatePayload = Partial<JobFormPayload>;
