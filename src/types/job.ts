export type JobStatus =
  | "interested"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export type WorkStyle = "full_remote" | "hybrid" | "onsite";

export type EmploymentType = "full_time" | "contract";
export type MasterDataItem = {
  id: number;
  name: string;
  score_weight: number;
  active: boolean;
  display_order: number;
};

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
  position_id: number;
  location_id: number;
  position: string;
  status: JobStatus;
  work_style: WorkStyle;
  employment_type: EmploymentType;
  salary_min: number;
  salary_max: number;
  tech_stack_ids: number[];
  tech_stack: string;
  position_master: MasterDataItem;
  tech_stacks: MasterDataItem[];
  location_master: MasterDataItem;
  location: string;
  notes: string;
  company_logo_url: string | null;
  company_logo_filename: string | null;
  score: number;
  created_at: string;
  updated_at: string;
};

export type JobsListMeta = {
  page: number;
  per_page: number;
  total_count: number;
  summary: {
    remote_friendly: number;
    active_pipeline: number;
    high_score: number;
  };
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
  | "position_id"
  | "status"
  | "work_style"
  | "employment_type"
  | "salary_min"
  | "salary_max"
  | "tech_stack_ids"
  | "location_id"
  | "notes"
> & {
  company_logo?: File | null;
  remove_company_logo?: boolean;
};

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

export type MasterDataPayload = Omit<MasterDataItem, "id">;
