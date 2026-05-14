import { useEffect, useMemo, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { t } from "../i18n";
import type { JobDraftMode, JobDraftResponse, WorkStyle } from "../types/job";
import { formatSalaryRange } from "../utils/jobFormat";

type JobImportDrawerProps = {
  open: boolean;
  readOnly?: boolean;
  aiEnabled?: boolean;
  result: JobDraftResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onAnalyze: (payload: { mode: JobDraftMode; text: string; url: string }) => Promise<void>;
  onConfirm: () => void;
};

const MODE_OPTIONS: ReadonlyArray<{ value: JobDraftMode; labelKey: string }> = [
  { value: "rule", labelKey: "import.mode_rule" },
  { value: "ai", labelKey: "import.mode_ai" },
];

function renderList(items: string[]) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("import.empty_list")}
      </Typography>
    );
  }

  return (
    <Stack component="ul" spacing={0.75} sx={{ pl: 2.5, m: 0 }}>
      {items.map((item, index) => (
        <Typography key={`${item}-${index}`} component="li" variant="body2">
          {item}
        </Typography>
      ))}
    </Stack>
  );
}

function workStyleLabel(value: WorkStyle | null) {
  if (!value) return t("import.fields.unknown");
  return t(`enums.work_style.${value}`);
}

export default function JobImportDrawer({
  open,
  readOnly = false,
  aiEnabled = false,
  result,
  loading,
  error,
  onClose,
  onAnalyze,
  onConfirm,
}: JobImportDrawerProps) {
  const [mode, setMode] = useState<JobDraftMode>("rule");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (open) {
      setSubmitAttempted(false);
    }
  }, [open]);

  useEffect(() => {
    if (!aiEnabled && mode === "ai") setMode("rule");
  }, [aiEnabled, mode]);

  const textError = submitAttempted && !text.trim() ? t("import.text_required") : null;
  const aiUnavailable = mode === "ai" && aiEnabled && result?.ai_available === false;
  const fellBackToRule = mode === "ai" && aiEnabled && result?.mode === "rule";

  const draftSummary = useMemo(() => {
    if (!result) return null;
    const draft = result.draft;
    return [
      { key: "company_name", label: t("import.fields.company_name"), value: draft.company_name ?? t("import.fields.unknown") },
      {
        key: "salary_range",
        label: t("import.fields.salary_range"),
        value: draft.salary_min !== null && draft.salary_max !== null
          ? formatSalaryRange(draft.salary_min, draft.salary_max)
          : t("import.fields.unknown"),
      },
      { key: "work_style", label: t("import.fields.work_style"), value: workStyleLabel(draft.work_style) },
      { key: "location", label: t("import.fields.location"), value: draft.location_name ?? t("import.fields.unknown") },
      {
        key: "tech_stacks",
        label: t("import.fields.tech_stacks"),
        value: draft.tech_stack_names.length > 0 ? draft.tech_stack_names.join(", ") : t("import.fields.unknown"),
      },
      { key: "source_url", label: t("import.fields.source_url"), value: draft.source_url ?? t("import.fields.unknown") },
    ];
  }, [result]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(9, 30, 66, 0.1)" } } }}
    >
      <Box sx={{ width: { xs: 380, sm: 760 }, p: 3, backgroundColor: "#f5f7fb", minHeight: "100%" }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6">{t("import.title")}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.7 }}>
              {t("import.helper")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 0.95fr)" },
              alignItems: "start",
            }}
          >
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" color="primary" label={t("import.before_badge")} />
                  <Typography variant="subtitle2">{t("import.before_title")}</Typography>
                </Stack>

                <FormControl>
                  <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{t("import.mode_label")}</FormLabel>
                  <RadioGroup row value={mode} onChange={(event) => setMode(event.target.value as JobDraftMode)}>
                    {MODE_OPTIONS.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio size="small" />}
                        label={t(option.labelKey)}
                        disabled={option.value === "ai" && !aiEnabled}
                      />
                    ))}
                  </RadioGroup>
                  {!aiEnabled && (
                    <Typography variant="caption" color="text.secondary">
                      {t("import.mode_ai_master_only")}
                    </Typography>
                  )}
                  {aiUnavailable && (
                    <Typography variant="caption" color="warning.main">
                      {t("import.mode_ai_unavailable")}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  label={t("import.url_label")}
                  placeholder={t("import.url_placeholder")}
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  size="small"
                  fullWidth
                />

                <TextField
                  label={t("import.text_label")}
                  placeholder={t("import.text_placeholder")}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  multiline
                  minRows={12}
                  size="small"
                  fullWidth
                  error={Boolean(textError)}
                  helperText={textError ?? " "}
                />

                {error && <Alert severity="error">{error}</Alert>}
                {readOnly && <Alert severity="info">{t("import.read_only_hint")}</Alert>}
                {loading && <LinearProgress />}

                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                  <Button variant="text" onClick={onClose} disabled={loading}>
                    {t("actions.cancel")}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setSubmitAttempted(true);
                      if (!text.trim()) return;
                      void onAnalyze({ mode, text, url });
                    }}
                    disabled={loading}
                  >
                    {loading ? t("import.analyzing") : t("import.analyze")}
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                  <Chip size="small" color="success" label={t("import.after_badge")} />
                  <Typography variant="subtitle2">{t("import.after_title")}</Typography>
                  {result && (
                    <Chip
                      size="small"
                      color={result.mode === "ai" ? "primary" : "default"}
                      variant={result.mode === "ai" ? "filled" : "outlined"}
                      label={result.mode === "ai" ? t("import.actual_mode_ai") : t("import.actual_mode_rule")}
                    />
                  )}
                </Stack>

                {fellBackToRule && (
                  <Typography variant="caption" color="warning.main">
                    {t("import.fallback_to_rule")}
                  </Typography>
                )}

                {!result || !draftSummary ? (
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {t("import.after_empty")}
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {t("import.draft_section")}
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {draftSummary.map((row) => (
                          <Stack key={row.key} direction="row" justifyContent="space-between" spacing={1.5}>
                            <Typography variant="caption" color="text.secondary">
                              {row.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ textAlign: "right", maxWidth: "62%", wordBreak: "break-word" }}
                            >
                              {row.value}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {t("import.insights_section")}
                      </Typography>
                      {result.insights.score_estimate !== null && (
                        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 0.75, mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t("import.score_label")}
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1 }}>
                            {result.insights.score_estimate}
                          </Typography>
                        </Stack>
                      )}

                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                            {t("import.pros_label")}
                          </Typography>
                          {renderList(result.insights.pros)}
                        </Box>
                        <Box>
                          <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                            {t("import.cons_label")}
                          </Typography>
                          {renderList(result.insights.cons)}
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            {t("import.questions_label")}
                          </Typography>
                          {renderList(result.insights.questions)}
                        </Box>
                      </Stack>
                    </Box>

                    {!readOnly && (
                      <Button variant="contained" size="large" onClick={onConfirm}>
                        {t("import.confirm")}
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}
