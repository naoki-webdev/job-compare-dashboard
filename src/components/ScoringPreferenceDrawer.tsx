import { memo, useEffect, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { t } from "../i18n";
import type { ScoringPreference, ScoringPreferencePayload } from "../types/job";

type ScoringPreferenceDrawerProps = {
  open: boolean;
  preference: ScoringPreference | null;
  submitting: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: ScoringPreferencePayload) => Promise<void> | void;
};

const emptyValues: ScoringPreferencePayload = {
  full_remote_weight: 30,
  hybrid_weight: 15,
  onsite_weight: -30,
  rails_weight: 20,
  typescript_weight: 15,
  high_salary_max_threshold: 8_000_000,
  high_salary_bonus: 10,
  low_salary_min_threshold: 4_000_000,
  low_salary_penalty: -10,
};

function ScoringPreferenceDrawer({
  open,
  preference,
  submitting,
  submitError,
  onClose,
  onSubmit,
}: ScoringPreferenceDrawerProps) {
  const [values, setValues] = useState<ScoringPreferencePayload>(emptyValues);

  useEffect(() => {
    if (open && preference) {
      setValues({
        full_remote_weight: preference.full_remote_weight,
        hybrid_weight: preference.hybrid_weight,
        onsite_weight: preference.onsite_weight,
        rails_weight: preference.rails_weight,
        typescript_weight: preference.typescript_weight,
        high_salary_max_threshold: preference.high_salary_max_threshold,
        high_salary_bonus: preference.high_salary_bonus,
        low_salary_min_threshold: preference.low_salary_min_threshold,
        low_salary_penalty: preference.low_salary_penalty,
      });
    }
  }, [open, preference]);

  const handleChange = (key: keyof ScoringPreferencePayload, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderNumberField = (key: keyof ScoringPreferencePayload) => (
    <TextField
      key={key}
      label={t(`scoring.${key}`)}
      type="number"
      value={values[key]}
      onChange={(event) => handleChange(key, Number(event.target.value))}
      size="small"
      fullWidth
    />
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 360, sm: 460 }, p: 3, backgroundColor: "#f5f7fb", minHeight: "100%" }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6">{t("scoring.title")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("scoring.helper")}
            </Typography>
          </Box>

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t("scoring.remote_section")}</Typography>
            {renderNumberField("full_remote_weight")}
            {renderNumberField("hybrid_weight")}
            {renderNumberField("onsite_weight")}
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t("scoring.stack_section")}</Typography>
            {renderNumberField("rails_weight")}
            {renderNumberField("typescript_weight")}
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t("scoring.salary_section")}</Typography>
            {renderNumberField("high_salary_max_threshold")}
            {renderNumberField("high_salary_bonus")}
            {renderNumberField("low_salary_min_threshold")}
            {renderNumberField("low_salary_penalty")}
          </Stack>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="text" onClick={onClose} disabled={submitting}>
              {t("actions.cancel")}
            </Button>
            <Button variant="contained" onClick={() => void onSubmit(values)} disabled={submitting}>
              {submitting ? t("actions.saving") : t("actions.save")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default memo(ScoringPreferenceDrawer);
