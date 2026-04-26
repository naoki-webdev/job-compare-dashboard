import { useCallback, useEffect, useState } from "react";

import type { MasterDataPayload, ScoringPreferencePayload } from "../types/job";
import { useJobsList } from "./useJobsList";
import { useMasterData } from "./useMasterData";
import { useScoringPreference } from "./useScoringPreference";

export function useJobsDashboard() {
  const jobsList = useJobsList();
  const masterData = useMasterData();
  const scoring = useScoringPreference();
  const [demoStateApplied, setDemoStateApplied] = useState(false);
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

  const error = jobsList.error ?? masterData.loadError ?? scoring.loadError;

  return {
    jobs: jobsList.jobs,
    locations: masterData.locations,
    positions: masterData.positions,
    techStacks: masterData.techStacks,
    selectedJob: jobsList.selectedJob,
    drawerOpen: jobsList.drawerOpen,
    formOpen: jobsList.formOpen,
    formMode: jobsList.formMode,
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
    handleExportCsv: jobsList.handleExportCsv,
  };
}
