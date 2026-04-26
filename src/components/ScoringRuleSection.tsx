import { memo } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { t } from "../i18n";
import type { ScoringPreferencePayload } from "../types/job";
import { type ScoringPreferenceDraft, parseNumericInput } from "./masterDataDrafts";

type ScoringRuleSectionProps = {
  values: ScoringPreferenceDraft;
  error?: string | null;
  onChange: (key: keyof ScoringPreferenceDraft, value: number | "") => void;
};

function ScoringRuleSection({ values, error, onChange }: ScoringRuleSectionProps) {
  const renderScoringField = (key: keyof ScoringPreferencePayload) => (
    <TextField
      key={key}
      label={t(`scoring.${key}`)}
      type="number"
      value={values[key]}
      onChange={(event) => onChange(key, parseNumericInput(event.target.value))}
      size="small"
      fullWidth
    />
  );

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t("settings.rules_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("settings.rules_helper")}
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">{t("scoring.remote_section")}</Typography>
          {renderScoringField("full_remote_weight")}
          {renderScoringField("hybrid_weight")}
          {renderScoringField("onsite_weight")}
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">{t("scoring.salary_section")}</Typography>
          {renderScoringField("high_salary_max_threshold")}
          {renderScoringField("high_salary_bonus")}
          {renderScoringField("low_salary_min_threshold")}
          {renderScoringField("low_salary_penalty")}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default memo(ScoringRuleSection);
