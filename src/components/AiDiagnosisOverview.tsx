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
import { getPriorityView, getTopScoredJobs } from "../utils/jobDashboardInsights";
import ScoreChip from "./ScoreChip";

type AiDiagnosisOverviewProps = {
  jobs: Job[];
  onSelectJob: (jobId: number) => void;
};

function AiDiagnosisOverview({ jobs, onSelectJob }: AiDiagnosisOverviewProps) {
  const topJobs = useMemo(() => getTopScoredJobs(jobs, 3), [jobs]);
  const bestJob = topJobs[0] ?? null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 5,
        backgroundColor: "rgba(255,255,255,0.98)",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box sx={{ maxWidth: 760 }}>
            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 0 }}>
              {t("diagnosis.eyebrow")}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25, fontWeight: 850, lineHeight: 1.24 }}>
              {t("diagnosis.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.65 }}>
              {t("diagnosis.subtitle")}
            </Typography>
          </Box>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            px: { xs: 1.5, md: 1.75 },
            py: 1.25,
            borderRadius: 3,
            backgroundColor: "#f8fafc",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1, md: 1.5 }}
            divider={<Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />}
          >
            {[
              { step: "1", color: "primary" as const, title: t("diagnosis.input_title"), body: t("diagnosis.input_body") },
              {
                step: "2",
                color: "secondary" as const,
                title: t("diagnosis.extraction_title"),
                body: t("diagnosis.extraction_body"),
              },
              {
                step: "3",
                color: "success" as const,
                title: t("diagnosis.decision_title"),
                body: bestJob
                  ? t("diagnosis.best_job", { company: bestJob.company_name })
                  : t("diagnosis.empty_decision"),
              },
            ].map((item) => (
              <Stack key={item.step} direction="row" spacing={1} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                <Chip label={item.step} size="small" color={item.color} sx={{ flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={850}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.55, display: "block" }}>
                    {item.body}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>

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
