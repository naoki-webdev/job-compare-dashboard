import { useCallback, useState } from "react";

import { createJobDraft, getApiErrorMessage } from "../api/jobs";
import { t } from "../i18n";
import type { JobDraftMode, JobDraftResponse, JobFormPayload } from "../types/job";

type AnalyzeImportParams = {
  mode: JobDraftMode;
  text: string;
  url: string;
};

type UseJobImportParams = {
  openCreateForm: (draft: Partial<JobFormPayload>) => void;
};

export function useJobImport({ openCreateForm }: UseJobImportParams) {
  const [importOpen, setImportOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<JobDraftResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleOpenImport = useCallback(() => {
    setImportResult(null);
    setImportError(null);
    setImportOpen(true);
  }, []);

  const handleCloseImport = useCallback(() => {
    setImportOpen(false);
  }, []);

  const handleAnalyzeImport = useCallback(async ({ mode, text, url }: AnalyzeImportParams) => {
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
  }, []);

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
    openCreateForm(formDraft);
  }, [importResult, openCreateForm]);

  return {
    importOpen,
    importLoading,
    importResult,
    importError,
    handleOpenImport,
    handleCloseImport,
    handleAnalyzeImport,
    handleConfirmImport,
  };
}
