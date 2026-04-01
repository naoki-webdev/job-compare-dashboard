import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildJobsExportUrl,
  createJob,
  deleteJob,
  fetchJob,
  fetchJobs,
  fetchScoringPreference,
  updateJob,
  updateScoringPreference,
} from "../api/jobs";
import { t } from "../i18n";
import type {
  Job,
  JobFormPayload,
  JobSortKey,
  JobStatus,
  JobsListParams,
  ScoringPreference,
  ScoringPreferencePayload,
  SortDirection,
  WorkStyle,
} from "../types/job";

const ACTIVE_PIPELINE_STATUSES: JobStatus[] = ["interested", "applied", "interviewing"];

export function useJobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [scoringOpen, setScoringOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [workStyles, setWorkStyles] = useState<WorkStyle[]>([]);
  const [sort, setSort] = useState<JobSortKey>("updated_at");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [deletingJob, setDeletingJob] = useState(false);
  const [submittingScoring, setSubmittingScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [scoringPreference, setScoringPreference] = useState<ScoringPreference | null>(null);
  const [demoStateApplied, setDemoStateApplied] = useState(false);

  const listParams = useMemo<JobsListParams>(
    () => ({
      keyword,
      status: statuses,
      work_style: workStyles,
      sort,
      direction,
      page,
      per_page: perPage,
    }),
    [direction, keyword, page, perPage, sort, statuses, workStyles],
  );

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchJobs(listParams);
      setJobs(response.jobs);
      setTotalCount(response.meta.total_count);
    } catch {
      setError(t("errors.fetch_jobs"));
    } finally {
      setLoading(false);
    }
  }, [listParams]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    fetchScoringPreference()
      .then(setScoringPreference)
      .catch(() => setError(t("errors.fetch_scoring")));
  }, []);

  useEffect(() => {
    if (demoStateApplied || loading) return;

    const demoState = new URLSearchParams(window.location.search).get("demo");
    if (!demoState) return;

    if (demoState === "form") {
      setFormMode("create");
      setFormOpen(true);
      setDemoStateApplied(true);
      return;
    }

    if (demoState === "detail" && jobs[0]) {
      setSelectedJob(jobs[0]);
      setDrawerOpen(true);
      setDemoStateApplied(true);
    }
  }, [demoStateApplied, jobs, loading]);

  const handleKeywordChange = useCallback((value: string) => {
    setPage(1);
    setKeyword(value);
  }, []);

  const handleStatusesChange = useCallback((values: JobStatus[]) => {
    setPage(1);
    setStatuses(values);
  }, []);

  const handleWorkStylesChange = useCallback((values: WorkStyle[]) => {
    setPage(1);
    setWorkStyles(values);
  }, []);

  const handleSortChange = useCallback((nextSort: JobSortKey, nextDirection: SortDirection) => {
    setSort(nextSort);
    setDirection(nextDirection);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handlePerPageChange = useCallback((value: number) => {
    setPerPage(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setKeyword("");
    setStatuses([]);
    setWorkStyles([]);
    setPage(1);
  }, []);

  const handleRowClick = useCallback(async (jobId: number) => {
    try {
      const job = await fetchJob(jobId);
      setSelectedJob(job);
      setDrawerOpen(true);
    } catch {
      setError(t("errors.fetch_job_detail"));
    }
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleOpenCreateForm = useCallback(() => {
    setFormMode("create");
    setFormError(null);
    setFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback(() => {
    if (!selectedJob) return;

    setFormMode("edit");
    setFormError(null);
    setDrawerOpen(false);
    setFormOpen(true);
  }, [selectedJob]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setFormError(null);
  }, []);

  const handleOpenScoring = useCallback(() => {
    setScoringError(null);
    setScoringOpen(true);
  }, []);

  const handleCloseScoring = useCallback(() => {
    setScoringOpen(false);
    setScoringError(null);
  }, []);

  const handleStatusChange = useCallback(async (status: JobStatus) => {
    setError(null);

    if (!selectedJob) return;

    try {
      const updated = await updateJob(selectedJob.id, { status });
      setSelectedJob(updated);
      setJobs((prev) => prev.map((job) => (job.id === updated.id ? updated : job)));
    } catch {
      setError(t("errors.update_status"));
    }
  }, [selectedJob]);

  const handleSubmitForm = useCallback(async (payload: JobFormPayload) => {
    setSubmittingForm(true);
    setError(null);
    setFormError(null);

    try {
      if (formMode === "create") {
        await createJob(payload);
      } else if (selectedJob) {
        const updated = await updateJob(selectedJob.id, payload);
        setSelectedJob(updated);
        setDrawerOpen(true);
      }

      setFormOpen(false);
      await loadJobs();
    } catch {
      setFormError(t(formMode === "create" ? "errors.create_job" : "errors.update_job"));
    } finally {
      setSubmittingForm(false);
    }
  }, [formMode, loadJobs, selectedJob]);

  const handleDeleteJob = useCallback(async () => {
    if (!selectedJob || !window.confirm(t("jobs.detail.delete_confirm"))) return;

    setDeletingJob(true);
    setError(null);

    try {
      await deleteJob(selectedJob.id);
      setDrawerOpen(false);
      setFormOpen(false);
      setSelectedJob(null);
      await loadJobs();
    } catch {
      setError(t("errors.delete_job"));
    } finally {
      setDeletingJob(false);
    }
  }, [loadJobs, selectedJob]);

  const handleSubmitScoring = useCallback(async (payload: ScoringPreferencePayload) => {
    setSubmittingScoring(true);
    setScoringError(null);

    try {
      const updated = await updateScoringPreference(payload);
      setScoringPreference(updated);
      setScoringOpen(false);
      await loadJobs();

      if (selectedJob) {
        const refreshed = await fetchJob(selectedJob.id);
        setSelectedJob(refreshed);
      }
    } catch {
      setScoringError(t("errors.update_scoring"));
    } finally {
      setSubmittingScoring(false);
    }
  }, [loadJobs, selectedJob]);

  const handleExportCsv = useCallback(() => {
    const exportUrl = buildJobsExportUrl(listParams);
    window.open(exportUrl, "_blank", "noopener,noreferrer");
  }, [listParams]);

  const summaryItems = useMemo(
    () => [
      {
        key: "total" as const,
        value: totalCount,
        caption: t("summary.total_caption"),
      },
      {
        key: "remote_friendly" as const,
        value: jobs.filter((job) => job.work_style !== "onsite").length,
        caption: t("summary.remote_friendly_caption"),
      },
      {
        key: "active_pipeline" as const,
        value: jobs.filter((job) => ACTIVE_PIPELINE_STATUSES.includes(job.status)).length,
        caption: t("summary.active_pipeline_caption"),
      },
      {
        key: "high_score" as const,
        value: jobs.filter((job) => job.score >= 50).length,
        caption: t("summary.high_score_caption"),
      },
    ],
    [jobs, totalCount],
  );

  return {
    jobs,
    selectedJob,
    drawerOpen,
    formOpen,
    formMode,
    scoringOpen,
    keyword,
    statuses,
    workStyles,
    sort,
    direction,
    page,
    perPage,
    totalCount,
    loading,
    submittingForm,
    deletingJob,
    submittingScoring,
    error,
    formError,
    scoringError,
    scoringPreference,
    summaryItems,
    handleKeywordChange,
    handleStatusesChange,
    handleWorkStylesChange,
    handleSortChange,
    handlePageChange,
    handlePerPageChange,
    handleClearFilters,
    handleRowClick,
    handleCloseDrawer,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleCloseForm,
    handleOpenScoring,
    handleCloseScoring,
    handleStatusChange,
    handleSubmitForm,
    handleDeleteJob,
    handleSubmitScoring,
    handleExportCsv,
  };
}
