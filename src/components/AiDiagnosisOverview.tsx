import { memo, useMemo } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { t } from "../i18n";
import type { Job } from "../types/job";
import { calculateRate, getPriorityView, getTopScoredJobs } from "../utils/jobDashboardInsights";
import ScoreChip from "./ScoreChip";

type SummaryItem = {
  key: "total" | "remote_friendly" | "active_pipeline" | "high_score";
  value: number;
};

type AiDiagnosisOverviewProps = {
  jobs: Job[];
  totalCount: number;
  summaryItems: SummaryItem[];
  readOnly: boolean;
  onImport: () => void;
  onSelectJob: (jobId: number) => void;
};

function getSummaryValue(items: SummaryItem[], key: SummaryItem["key"]) {
  return items.find((item) => item.key === key)?.value ?? 0;
}

function AiDiagnosisOverview({
  jobs,
  totalCount,
  summaryItems,
  readOnly,
  onImport,
  onSelectJob,
}: AiDiagnosisOverviewProps) {
  const topJobs = useMemo(() => getTopScoredJobs(jobs, 3), [jobs]);
  const bestJob = topJobs[0] ?? null;
  const bestPriority = bestJob ? getPriorityView(bestJob.score) : null;
  const highScoreCount = getSummaryValue(summaryItems, "high_score");
  const remoteCount = getSummaryValue(summaryItems, "remote_friendly");
  const activePipelineCount = getSummaryValue(summaryItems, "active_pipeline");
  const remoteRate = calculateRate(remoteCount, totalCount);

  const metrics = [
    { label: t("diagnosis.metrics.candidates"), value: totalCount, suffix: t("diagnosis.metrics.jobs_unit") },
    { label: t("diagnosis.metrics.high_score"), value: highScoreCount, suffix: t("diagnosis.metrics.jobs_unit") },
    { label: t("diagnosis.metrics.remote_rate"), value: remoteRate, suffix: "%" },
    { label: t("diagnosis.metrics.active_pipeline"), value: activePipelineCount, suffix: t("diagnosis.metrics.jobs_unit") },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: 5,
        backgroundColor: "rgba(255,255,255,0.98)",
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "flex-end" }}
          justifyContent="space-between"
        >
          <Box sx={{ maxWidth: 760 }}>
            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 0 }}>
              {t("diagnosis.eyebrow")}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.25, fontWeight: 800, lineHeight: 1.18 }}>
              {t("diagnosis.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
              {t("diagnosis.subtitle")}
            </Typography>
          </Box>
          {!readOnly && (
            <Button variant="contained" size="large" onClick={onImport} sx={{ minWidth: { xs: "100%", sm: 220 } }}>
              {t("actions.import_job")}
            </Button>
          )}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          }}
        >
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, backgroundColor: "#f8fafc" }}>
            <Stack spacing={1.25}>
              <Chip label="1" size="small" color="primary" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="subtitle1" fontWeight={800}>
                {t("diagnosis.input_title")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {t("diagnosis.input_body")}
              </Typography>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, backgroundColor: "#f8fafc" }}>
            <Stack spacing={1.25}>
              <Chip label="2" size="small" color="secondary" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="subtitle1" fontWeight={800}>
                {t("diagnosis.extraction_title")}
              </Typography>
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {["company", "salary", "tech", "work_style", "selection"].map((key) => (
                  <Chip key={key} size="small" variant="outlined" label={t(`diagnosis.extraction_fields.${key}`)} />
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {t("diagnosis.extraction_body")}
              </Typography>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, backgroundColor: "#f8fafc" }}>
            <Stack spacing={1.25}>
              <Chip label="3" size="small" color="success" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="subtitle1" fontWeight={800}>
                {t("diagnosis.decision_title")}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h4" fontWeight={900}>
                  {bestJob?.score ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("diagnosis.score_unit")}
                </Typography>
                {bestPriority && (
                  <Chip size="small" color={bestPriority.color} variant="outlined" label={bestPriority.label} />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {bestJob
                  ? t("diagnosis.best_job", { company: bestJob.company_name })
                  : t("diagnosis.empty_decision")}
              </Typography>
            </Stack>
          </Paper>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          }}
        >
          {metrics.map((metric) => (
            <Box key={metric.label} sx={{ py: 1.25, px: 1.5, borderRadius: 3, backgroundColor: "#f4f6f8" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {metric.label}
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={0.5}>
                <Typography variant="h5" fontWeight={900}>
                  {metric.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {metric.suffix}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: "rgba(9,30,66,0.1)" }} />

        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                {t("diagnosis.ranking_title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("diagnosis.ranking_description")}
              </Typography>
            </Box>
          </Stack>
          {topJobs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("diagnosis.ranking_empty")}
            </Typography>
          ) : (
            <Stack spacing={1}>
              {topJobs.map((job, index) => {
                const priority = getPriorityView(job.score);
                return (
                  <Button
                    key={job.id}
                    variant="outlined"
                    color="inherit"
                    onClick={() => onSelectJob(job.id)}
                    sx={{
                      justifyContent: "stretch",
                      p: 1.25,
                      borderRadius: 3,
                      color: "text.primary",
                      textAlign: "left",
                      borderColor: "rgba(9,30,66,0.12)",
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: "100%", minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={900} sx={{ width: 28, color: "primary.main" }}>
                        {index + 1}
                      </Typography>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={800} noWrap>
                          {job.company_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {job.position}
                        </Typography>
                      </Box>
                      <Chip size="small" color={priority.color} variant="outlined" label={priority.label} />
                      <ScoreChip score={job.score} />
                    </Stack>
                  </Button>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default memo(AiDiagnosisOverview);
