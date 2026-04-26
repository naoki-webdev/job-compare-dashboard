import { useCallback, useMemo, useState } from "react";

import {
  buildJobsExportUrl,
  createJob,
  deleteJob,
  fetchJob,
  fetchJobs,
  getApiErrorMessage,
  updateJob,
} from "../api/jobs";
import { t } from "../i18n";
import type {
  Job,
  JobFormPayload,
  JobSortKey,
  JobStatus,
  JobsListParams,
  SortDirection,
  WorkStyle,
} from "../types/job";

export function useJobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [keyword, setKeyword] = useState("");
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [workStyles, setWorkStyles] = useState<WorkStyle[]>([]);
  const [sort, setSort] = useState<JobSortKey>("score");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [deletingJob, setDeletingJob] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [summaryCounts, setSummaryCounts] = useState({
    remote_friendly: 0,
    active_pipeline: 0,
    high_score: 0,
  });

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
      setSummaryCounts(response.meta.summary);
    } catch {
      setError(t("errors.fetch_jobs"));
    } finally {
      setLoading(false);
    }
  }, [listParams]);

  const refreshSelectedJob = useCallback(async () => {
    if (!selectedJob) return;

    try {
      const refreshed = await fetchJob(selectedJob.id);
      setSelectedJob(refreshed);
      setJobs((prev) => prev.map((job) => (job.id === refreshed.id ? refreshed : job)));
    } catch {
      setError(t("errors.fetch_job_detail"));
    }
  }, [selectedJob]);

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

  const openJobPreview = useCallback((job: Job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
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

  const handleStatusChange = useCallback(async (status: JobStatus) => {
    setError(null);

    if (!selectedJob) return;

    try {
      const updated = await updateJob(selectedJob.id, { status });
      setSelectedJob(updated);
      setJobs((prev) => prev.map((job) => (job.id === updated.id ? updated : job)));
    } catch (error) {
      setError(getApiErrorMessage(error, t("errors.update_status")));
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
    } catch (error) {
      setFormError(getApiErrorMessage(error, t(formMode === "create" ? "errors.create_job" : "errors.update_job")));
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
    } catch (error) {
      setError(getApiErrorMessage(error, t("errors.delete_job")));
    } finally {
      setDeletingJob(false);
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
        value: summaryCounts.remote_friendly,
        caption: t("summary.remote_friendly_caption"),
      },
      {
        key: "active_pipeline" as const,
        value: summaryCounts.active_pipeline,
        caption: t("summary.active_pipeline_caption"),
      },
      {
        key: "high_score" as const,
        value: summaryCounts.high_score,
        caption: t("summary.high_score_caption"),
      },
    ],
    [summaryCounts.active_pipeline, summaryCounts.high_score, summaryCounts.remote_friendly, totalCount],
  );

  const recommendedJobIds = useMemo(() => {
    if (jobs.length === 0) return [];

    const sortedScores = jobs.map((job) => job.score).sort((left, right) => right - left);
    const thresholdIndex = Math.max(0, Math.ceil(sortedScores.length * 0.1) - 1);
    const threshold = sortedScores[thresholdIndex];

    return jobs.filter((job) => job.score >= threshold).map((job) => job.id);
  }, [jobs]);

  return {
    jobs,
    selectedJob,
    drawerOpen,
    formOpen,
    formMode,
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
    error,
    formError,
    summaryItems,
    recommendedJobIds,
    loadJobs,
    refreshSelectedJob,
    handleKeywordChange,
    handleStatusesChange,
    handleWorkStylesChange,
    handleSortChange,
    handlePageChange,
    handlePerPageChange,
    handleClearFilters,
    handleRowClick,
    openJobPreview,
    handleCloseDrawer,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleCloseForm,
    handleStatusChange,
    handleSubmitForm,
    handleDeleteJob,
    handleExportCsv,
  };
}
