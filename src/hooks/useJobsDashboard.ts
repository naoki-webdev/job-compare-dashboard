import { useCallback, useEffect, useState } from "react";

import { createJobDraft, getApiErrorMessage } from "../api/jobs";
import { t } from "../i18n";
import type {
  JobDraftMode,
  JobDraftResponse,
  JobFormPayload,
  EvaluationKeywordPayload,
  InterviewQuestionPayload,
  MasterDataPayload,
  ScoringPreferencePayload,
} from "../types/job";
import { useJobsList } from "./useJobsList";
import { useMasterData } from "./useMasterData";
import { useScoringPreference } from "./useScoringPreference";

export function useJobsDashboard() {
  const jobsList = useJobsList();
  const masterData = useMasterData();
  const scoring = useScoringPreference();
  const [demoStateApplied, setDemoStateApplied] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<JobDraftResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const {
    jobs,
    loading,
    loadJobs,
    refreshSelectedJob,
    openJobPreview,
    handleOpenCreateForm,
  } = jobsList;
  const { handleOpenMasterData: openMasterData, handleCloseMasterData: closeMasterData } = masterData;
  const { clearScoringError, handleSubmitScoring: submitScoring } = scoring;

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (demoStateApplied || loading) return;

    const demoState = new URLSearchParams(window.location.search).get("demo");
    if (!demoState) return;

    if (demoState === "form") {
      handleOpenCreateForm();
      setDemoStateApplied(true);
      return;
    }

    if (demoState === "settings") {
      openMasterData();
      setDemoStateApplied(true);
      return;
    }

    if (demoState === "detail" && jobs[0]) {
      openJobPreview(jobs[0]);
      setDemoStateApplied(true);
    }
  }, [demoStateApplied, handleOpenCreateForm, jobs, loading, openJobPreview, openMasterData]);

  const reloadJobsAndSelection = useCallback(async () => {
    await loadJobs();
    await refreshSelectedJob();
  }, [loadJobs, refreshSelectedJob]);

  const handleOpenMasterData = useCallback(() => {
    clearScoringError();
    openMasterData();
  }, [clearScoringError, openMasterData]);

  const handleCloseMasterData = useCallback(() => {
    clearScoringError();
    closeMasterData();
  }, [clearScoringError, closeMasterData]);

  const handleSubmitScoring = useCallback(async (payload: ScoringPreferencePayload) => {
    const updated = await submitScoring(payload);
    if (!updated) return;

    closeMasterData();
    await reloadJobsAndSelection();
  }, [closeMasterData, reloadJobsAndSelection, submitScoring]);

  const withMasterDataRefresh = useCallback(
    async (action: () => Promise<boolean>) => {
      const updated = await action();
      if (!updated) return;

      await reloadJobsAndSelection();
    },
    [reloadJobsAndSelection],
  );

  const handleOpenImport = useCallback(() => {
    setImportResult(null);
    setImportError(null);
    setImportOpen(true);
  }, []);

  const handleCloseImport = useCallback(() => {
    setImportOpen(false);
  }, []);

  const handleAnalyzeImport = useCallback(
    async ({ mode, text, url }: { mode: JobDraftMode; text: string; url: string }) => {
      setImportLoading(true);
      setImportError(null);
      try {
        const response = await createJobDraft({ mode, text, url });
        setImportResult(response);
      } catch (error) {
        setImportError(getApiErrorMessage(error, t("errors.import_job")));
      } finally {
        setImportLoading(false);
      }
    },
    [],
  );

  const handleConfirmImport = useCallback(() => {
    if (!importResult) return;

    const { draft } = importResult;
    const formDraft: Partial<JobFormPayload> = {
      company_name: draft.company_name ?? undefined,
      salary_min: draft.salary_min ?? undefined,
      salary_max: draft.salary_max ?? undefined,
      work_style: draft.work_style ?? undefined,
      tech_stack_ids: draft.tech_stack_ids,
      location_id: draft.location_id ?? undefined,
      source_url: draft.source_url ?? undefined,
    };

    setImportOpen(false);
    jobsList.handleOpenCreateForm(formDraft);
  }, [importResult, jobsList]);

  const handleCreatePosition = useCallback(async (payload: MasterDataPayload) => {
    await withMasterDataRefresh(() => masterData.handleCreatePosition(payload));
  }, [masterData, withMasterDataRefresh]);

  const handleUpdatePosition = useCallback(async (id: number, payload: MasterDataPayload) => {
    await withMasterDataRefresh(() => masterData.handleUpdatePosition(id, payload));
  }, [masterData, withMasterDataRefresh]);

  const handleDeletePosition = useCallback(async (id: number) => {
    await withMasterDataRefresh(() => masterData.handleDeletePosition(id));
  }, [masterData, withMasterDataRefresh]);

  const handleCreateLocation = useCallback(async (payload: MasterDataPayload) => {
    await withMasterDataRefresh(() => masterData.handleCreateLocation(payload));
  }, [masterData, withMasterDataRefresh]);

  const handleUpdateLocation = useCallback(async (id: number, payload: MasterDataPayload) => {
    await withMasterDataRefresh(() => masterData.handleUpdateLocation(id, payload));
  }, [masterData, withMasterDataRefresh]);

  const handleDeleteLocation = useCallback(async (id: number) => {
    await withMasterDataRefresh(() => masterData.handleDeleteLocation(id));
  }, [masterData, withMasterDataRefresh]);

  const handleCreateTechStack = useCallback(async (payload: MasterDataPayload) => {
    await withMasterDataRefresh(() => masterData.handleCreateTechStack(payload));
  }, [masterData, withMasterDataRefresh]);

  const handleUpdateTechStack = useCallback(async (id: number, payload: MasterDataPayload) => {
    await withMasterDataRefresh(() => masterData.handleUpdateTechStack(id, payload));
  }, [masterData, withMasterDataRefresh]);

  const handleDeleteTechStack = useCallback(async (id: number) => {
    await withMasterDataRefresh(() => masterData.handleDeleteTechStack(id));
  }, [masterData, withMasterDataRefresh]);

  const handleCreatePositiveKeyword = useCallback(async (payload: EvaluationKeywordPayload) => {
    await masterData.handleCreatePositiveKeyword(payload);
  }, [masterData]);

  const handleUpdatePositiveKeyword = useCallback(async (id: number, payload: EvaluationKeywordPayload) => {
    await masterData.handleUpdatePositiveKeyword(id, payload);
  }, [masterData]);

  const handleDeletePositiveKeyword = useCallback(async (id: number) => {
    await masterData.handleDeletePositiveKeyword(id);
  }, [masterData]);

  const handleCreateNegativeKeyword = useCallback(async (payload: EvaluationKeywordPayload) => {
    await masterData.handleCreateNegativeKeyword(payload);
  }, [masterData]);

  const handleUpdateNegativeKeyword = useCallback(async (id: number, payload: EvaluationKeywordPayload) => {
    await masterData.handleUpdateNegativeKeyword(id, payload);
  }, [masterData]);

  const handleDeleteNegativeKeyword = useCallback(async (id: number) => {
    await masterData.handleDeleteNegativeKeyword(id);
  }, [masterData]);

  const handleCreateInterviewQuestion = useCallback(async (payload: InterviewQuestionPayload) => {
    await masterData.handleCreateInterviewQuestion(payload);
  }, [masterData]);

  const handleUpdateInterviewQuestion = useCallback(async (id: number, payload: InterviewQuestionPayload) => {
    await masterData.handleUpdateInterviewQuestion(id, payload);
  }, [masterData]);

  const handleDeleteInterviewQuestion = useCallback(async (id: number) => {
    await masterData.handleDeleteInterviewQuestion(id);
  }, [masterData]);

  const error = jobsList.error ?? masterData.loadError ?? scoring.loadError;

  return {
    jobs: jobsList.jobs,
    locations: masterData.locations,
    positions: masterData.positions,
    techStacks: masterData.techStacks,
    positiveKeywords: masterData.positiveKeywords,
    negativeKeywords: masterData.negativeKeywords,
    interviewQuestions: masterData.interviewQuestions,
    selectedJob: jobsList.selectedJob,
    drawerOpen: jobsList.drawerOpen,
    formOpen: jobsList.formOpen,
    formMode: jobsList.formMode,
    formInitialDraft: jobsList.formInitialDraft,
    importOpen,
    importLoading,
    importResult,
    importError,
    masterDataOpen: masterData.masterDataOpen,
    keyword: jobsList.keyword,
    statuses: jobsList.statuses,
    workStyles: jobsList.workStyles,
    sort: jobsList.sort,
    direction: jobsList.direction,
    page: jobsList.page,
    perPage: jobsList.perPage,
    totalCount: jobsList.totalCount,
    loading: jobsList.loading,
    submittingForm: jobsList.submittingForm,
    deletingJob: jobsList.deletingJob,
    submittingScoring: scoring.submittingScoring,
    submittingMasterData: masterData.submittingMasterData,
    error,
    formError: jobsList.formError,
    scoringError: scoring.scoringError,
    masterDataError: masterData.masterDataError,
    scoringPreference: scoring.scoringPreference,
    summaryItems: jobsList.summaryItems,
    recommendedJobIds: jobsList.recommendedJobIds,
    handleKeywordChange: jobsList.handleKeywordChange,
    handleStatusesChange: jobsList.handleStatusesChange,
    handleWorkStylesChange: jobsList.handleWorkStylesChange,
    handleSortChange: jobsList.handleSortChange,
    handlePageChange: jobsList.handlePageChange,
    handlePerPageChange: jobsList.handlePerPageChange,
    handleClearFilters: jobsList.handleClearFilters,
    handleRowClick: jobsList.handleRowClick,
    handleCloseDrawer: jobsList.handleCloseDrawer,
    handleOpenCreateForm: jobsList.handleOpenCreateForm,
    handleOpenEditForm: jobsList.handleOpenEditForm,
    handleCloseForm: jobsList.handleCloseForm,
    handleOpenImport,
    handleCloseImport,
    handleAnalyzeImport,
    handleConfirmImport,
    handleOpenMasterData,
    handleCloseMasterData,
    handleStatusChange: jobsList.handleStatusChange,
    handleSubmitForm: jobsList.handleSubmitForm,
    handleDeleteJob: jobsList.handleDeleteJob,
    handleSubmitScoring,
    handleCreatePosition,
    handleUpdatePosition,
    handleDeletePosition,
    handleCreateLocation,
    handleUpdateLocation,
    handleDeleteLocation,
    handleCreateTechStack,
    handleUpdateTechStack,
    handleDeleteTechStack,
    handleCreatePositiveKeyword,
    handleUpdatePositiveKeyword,
    handleDeletePositiveKeyword,
    handleCreateNegativeKeyword,
    handleUpdateNegativeKeyword,
    handleDeleteNegativeKeyword,
    handleCreateInterviewQuestion,
    handleUpdateInterviewQuestion,
    handleDeleteInterviewQuestion,
    handleExportCsv: jobsList.handleExportCsv,
  };
}
