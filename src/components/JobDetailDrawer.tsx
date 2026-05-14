import { memo } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import { isJobStatus, JOB_STATUS_OPTIONS } from "../constants/jobOptions";
import { t } from "../i18n";
import type { Job, JobStatus, ScoringPreference } from "../types/job";
import { formatDateTime, formatSalaryRange } from "../utils/jobFormat";
import { buildJobDecisionInsights, getPriorityView } from "../utils/jobDashboardInsights";
import { buildScoreBreakdown } from "../utils/scoreBreakdown";
import CompanyLogoAvatar from "./CompanyLogoAvatar";
import ScoreChip from "./ScoreChip";
import ScoreRadarChart from "./ScoreRadarChart";

type JobDetailDrawerProps = {
  open: boolean;
  job: Job | null;
  recommended: boolean;
  scoringPreference: ScoringPreference | null;
  readOnly?: boolean;
  onClose: () => void;
  onStatusChange: (status: JobStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

function JobDetailDrawer({
  open,
  job,
  recommended,
  scoringPreference,
  readOnly = false,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
  deleting,
}: JobDetailDrawerProps) {
  const scoreBreakdown = job ? buildScoreBreakdown(job, scoringPreference) : [];
  const decisionInsights = job ? buildJobDecisionInsights(job, scoringPreference) : { strengths: [], checks: [] };
  const priority = job ? getPriorityView(job.score) : null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ backdrop: { invisible: true } }}>
      <Box sx={{ width: { xs: 360, sm: 500 }, p: 3, backgroundColor: "#f5f7fb", minHeight: "100%" }}>
        {!job ? (
          <Typography variant="body2" color="text.secondary">
            {t("jobs.detail.empty")}
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <CompanyLogoAvatar companyName={job.company_name} logoUrl={job.company_logo_url} size={56} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6">{job.company_name}</Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        {job.position}
                      </Typography>
                    </Box>
                  </Stack>
                  <ScoreChip score={job.score} recommended={recommended} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t("jobs.detail.helper")}
                </Typography>
                {recommended && (
                  <Chip
                    label={t("jobs.recommended_hint")}
                    color="secondary"
                    variant="outlined"
                    sx={{ alignSelf: "flex-start" }}
                  />
                )}
              </Stack>
            </Paper>

            {!readOnly && (
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" onClick={onEdit}>
                  {t("actions.edit_job")}
                </Button>
                <Button color="error" variant="outlined" onClick={onDelete} disabled={deleting}>
                  {t("actions.delete_job")}
                </Button>
              </Stack>
            )}

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">{t("jobs.detail.status")}</Typography>
                <FormControl size="small">
                  <InputLabel id="job-status-label">{t("jobs.detail.status")}</InputLabel>
                  <Select
                    labelId="job-status-label"
                    value={job.status}
                    label={t("jobs.detail.status")}
                    disabled={readOnly}
                    onChange={(event) => {
                      if (isJobStatus(event.target.value)) {
                        onStatusChange(event.target.value);
                      }
                    }}
                  >
                    {JOB_STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {t(`enums.job_status.${status}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            <ScoreRadarChart job={job} scoringPreference={scoringPreference} />

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                  <Typography variant="subtitle2">{t("jobs.detail.decision_title")}</Typography>
                  {priority && (
                    <Chip size="small" color={priority.color} variant="outlined" label={priority.label} />
                  )}
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {t("jobs.detail.strengths")}
                  </Typography>
                  {decisionInsights.strengths.length > 0 ? (
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      {decisionInsights.strengths.map((label, index) => (
                        <Chip key={`${label}-${index}`} size="small" color="success" variant="outlined" label={label} />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t("jobs.detail.no_strengths")}
                    </Typography>
                  )}
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {t("jobs.detail.checks")}
                  </Typography>
                  {decisionInsights.checks.length > 0 ? (
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      {decisionInsights.checks.map((label, index) => (
                        <Chip key={`${label}-${index}`} size="small" color="warning" variant="outlined" label={label} />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t("jobs.detail.no_checks")}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
              <Stack spacing={2}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">{t("jobs.detail.score")}</Typography>
                  {scoreBreakdown.length > 0 ? (
                    <Stack spacing={1}>
                      {scoreBreakdown.map((item) => (
                        <Stack key={`${item.label}-${item.value}`} direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            {item.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color={item.value >= 0 ? "success.main" : "text.primary"}
                          >
                            {item.value >= 0 ? `+${item.value}` : item.value}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t("jobs.detail.score_hint")}
                    </Typography>
                  )}
                </Stack>
                <Divider />
                <InfoRow label={t("jobs.detail.work_style")} value={t(`enums.work_style.${job.work_style}`)} />
                <InfoRow
                  label={t("jobs.detail.employment_type")}
                  value={t(`enums.employment_type.${job.employment_type}`)}
                />
                <InfoRow
                  label={t("jobs.detail.salary")}
                  value={formatSalaryRange(job.salary_min, job.salary_max)}
                />
                <InfoRow label={t("jobs.detail.tech_stack")} value={job.tech_stack} />
                <InfoRow label={t("jobs.detail.location")} value={job.location} />
                <InfoRow label={t("jobs.detail.notes")} value={job.notes || t("common.no_data")} />
                <Divider />
                <InfoRow label={t("jobs.detail.updated_at")} value={formatDateTime(job.updated_at)} />
              </Stack>
            </Paper>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}

export default memo(JobDetailDrawer);
