import type { ScoringPreference, ScoringPreferencePayload } from "../types/job";
import { API_BASE_URL, requestJson } from "./client";

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
