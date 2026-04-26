import { useCallback, useEffect, useState } from "react";

import { fetchScoringPreference, getApiErrorMessage, updateScoringPreference } from "../api/jobs";
import { t } from "../i18n";
import type { ScoringPreference, ScoringPreferencePayload } from "../types/job";
import { retry } from "../utils/retry";

export function useScoringPreference() {
  const [scoringPreference, setScoringPreference] = useState<ScoringPreference | null>(null);
  const [submittingScoring, setSubmittingScoring] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scoringError, setScoringError] = useState<string | null>(null);

  const loadScoringPreference = useCallback(async () => {
    setLoadError(null);

    try {
      const preference = await retry(() => fetchScoringPreference());
      setScoringPreference(preference);
    } catch {
      setLoadError(t("errors.fetch_scoring"));
    }
  }, []);

  useEffect(() => {
    void loadScoringPreference();
  }, [loadScoringPreference]);

  const clearScoringError = useCallback(() => {
    setScoringError(null);
  }, []);

  const handleSubmitScoring = useCallback(async (payload: ScoringPreferencePayload) => {
    setSubmittingScoring(true);
    setScoringError(null);

    try {
      const updated = await updateScoringPreference(payload);
      setScoringPreference(updated);
      return updated;
    } catch (error) {
      setScoringError(getApiErrorMessage(error, t("errors.update_scoring")));
      return null;
    } finally {
      setSubmittingScoring(false);
    }
  }, []);

  return {
    scoringPreference,
    submittingScoring,
    loadError,
    scoringError,
    loadScoringPreference,
    clearScoringError,
    handleSubmitScoring,
  };
}
