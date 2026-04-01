import { memo, useEffect, useMemo, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { t } from "../i18n";
import type { Job, JobFormPayload, JobStatus, WorkStyle, EmploymentType } from "../types/job";

type JobFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  initialJob: Job | null;
  submitting: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: JobFormPayload) => Promise<void> | void;
};

const statusOptions: JobStatus[] = ["interested", "applied", "interviewing", "offer", "rejected"];
const workStyleOptions: WorkStyle[] = ["full_remote", "hybrid", "onsite"];
const employmentTypeOptions: EmploymentType[] = ["full_time", "contract"];

const emptyForm: JobFormPayload = {
  company_name: "",
  position: "",
  status: "interested",
  work_style: "hybrid",
  employment_type: "full_time",
  salary_min: 4_500_000,
  salary_max: 6_000_000,
  tech_stack: "",
  location: "",
  notes: "",
};

function buildFormValues(job: Job | null): JobFormPayload {
  if (!job) return emptyForm;

  return {
    company_name: job.company_name,
    position: job.position,
    status: job.status,
    work_style: job.work_style,
    employment_type: job.employment_type,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    tech_stack: job.tech_stack,
    location: job.location,
    notes: job.notes,
  };
}

function JobFormDrawer({
  open,
  mode,
  initialJob,
  submitting,
  submitError,
  onClose,
  onSubmit,
}: JobFormDrawerProps) {
  const [formValues, setFormValues] = useState<JobFormPayload>(emptyForm);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof JobFormPayload, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (open) {
      setFormValues(buildFormValues(initialJob));
      setTouchedFields({});
      setSubmitAttempted(false);
    }
  }, [initialJob, open]);

  const handleChange = <K extends keyof JobFormPayload>(key: K, value: JobFormPayload[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = (key: keyof JobFormPayload) => {
    setTouchedFields((prev) => ({ ...prev, [key]: true }));
  };

  const errors = useMemo(() => {
    const nextErrors: Partial<Record<keyof JobFormPayload, string>> = {};

    if (!formValues.company_name.trim()) nextErrors.company_name = t("validation.required");
    if (!formValues.position.trim()) nextErrors.position = t("validation.required");
    if (!formValues.tech_stack.trim()) nextErrors.tech_stack = t("validation.required");
    if (!formValues.location.trim()) nextErrors.location = t("validation.required");
    if (formValues.salary_min < 0) nextErrors.salary_min = t("validation.non_negative");
    if (formValues.salary_max < 0) nextErrors.salary_max = t("validation.non_negative");
    if (formValues.salary_max < formValues.salary_min) nextErrors.salary_max = t("validation.salary_range");

    return nextErrors;
  }, [formValues]);

  const isValid = Object.keys(errors).length === 0;
  const getFieldError = (key: keyof JobFormPayload) =>
    submitAttempted || touchedFields[key] ? errors[key] : undefined;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 360, sm: 460 }, p: 3, backgroundColor: "#f5f7fb", minHeight: "100%" }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6">
              {mode === "create" ? t("jobs.form.create_title") : t("jobs.form.edit_title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("jobs.form.helper")}
            </Typography>
          </Box>

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            label={t("jobs.form.company_name")}
            value={formValues.company_name}
            onChange={(event) => handleChange("company_name", event.target.value)}
            onBlur={() => handleBlur("company_name")}
            size="small"
            required
            error={Boolean(getFieldError("company_name"))}
            helperText={getFieldError("company_name")}
          />
          <TextField
            label={t("jobs.form.position")}
            value={formValues.position}
            onChange={(event) => handleChange("position", event.target.value)}
            onBlur={() => handleBlur("position")}
            size="small"
            required
            error={Boolean(getFieldError("position"))}
            helperText={getFieldError("position")}
          />

          <FormControl size="small">
            <InputLabel id="job-form-status-label">{t("jobs.form.status")}</InputLabel>
            <Select
              labelId="job-form-status-label"
              label={t("jobs.form.status")}
              value={formValues.status}
              onChange={(event) => handleChange("status", event.target.value as JobStatus)}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(`enums.job_status.${status}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel id="job-form-work-style-label">{t("jobs.form.work_style")}</InputLabel>
            <Select
              labelId="job-form-work-style-label"
              label={t("jobs.form.work_style")}
              value={formValues.work_style}
              onChange={(event) => handleChange("work_style", event.target.value as WorkStyle)}
            >
              {workStyleOptions.map((workStyle) => (
                <MenuItem key={workStyle} value={workStyle}>
                  {t(`enums.work_style.${workStyle}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel id="job-form-employment-type-label">{t("jobs.form.employment_type")}</InputLabel>
            <Select
              labelId="job-form-employment-type-label"
              label={t("jobs.form.employment_type")}
              value={formValues.employment_type}
              onChange={(event) => handleChange("employment_type", event.target.value as EmploymentType)}
            >
              {employmentTypeOptions.map((employmentType) => (
                <MenuItem key={employmentType} value={employmentType}>
                  {t(`enums.employment_type.${employmentType}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <TextField
              label={t("jobs.form.salary_min")}
              type="number"
              fullWidth
              value={formValues.salary_min}
              onChange={(event) => handleChange("salary_min", Number(event.target.value))}
              onBlur={() => handleBlur("salary_min")}
              size="small"
              required
              error={Boolean(getFieldError("salary_min"))}
              helperText={getFieldError("salary_min")}
            />
            <TextField
              label={t("jobs.form.salary_max")}
              type="number"
              fullWidth
              value={formValues.salary_max}
              onChange={(event) => handleChange("salary_max", Number(event.target.value))}
              onBlur={() => handleBlur("salary_max")}
              size="small"
              required
              error={Boolean(getFieldError("salary_max"))}
              helperText={getFieldError("salary_max")}
            />
          </Stack>

          <TextField
            label={t("jobs.form.tech_stack")}
            value={formValues.tech_stack}
            onChange={(event) => handleChange("tech_stack", event.target.value)}
            onBlur={() => handleBlur("tech_stack")}
            size="small"
            required
            error={Boolean(getFieldError("tech_stack"))}
            helperText={getFieldError("tech_stack")}
          />
          <TextField
            label={t("jobs.form.location")}
            value={formValues.location}
            onChange={(event) => handleChange("location", event.target.value)}
            onBlur={() => handleBlur("location")}
            size="small"
            required
            error={Boolean(getFieldError("location"))}
            helperText={getFieldError("location")}
          />
          <TextField
            label={t("jobs.form.notes")}
            value={formValues.notes}
            onChange={(event) => handleChange("notes", event.target.value)}
            onBlur={() => handleBlur("notes")}
            multiline
            minRows={4}
            size="small"
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="text" onClick={onClose} disabled={submitting}>
              {t("actions.cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSubmitAttempted(true);
                if (!isValid) return;
                void onSubmit(formValues);
              }}
              disabled={submitting}
            >
              {submitting ? t("actions.saving") : t("actions.save")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default memo(JobFormDrawer);
