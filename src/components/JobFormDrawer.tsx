import { memo, useEffect, useMemo, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import {
  EMPLOYMENT_TYPE_OPTIONS,
  isEmploymentType,
  isJobStatus,
  isWorkStyle,
  JOB_STATUS_OPTIONS,
  WORK_STYLE_OPTIONS,
} from "../constants/jobOptions";
import { t } from "../i18n";
import type { Job, JobFormPayload, MasterDataItem } from "../types/job";
import CompanyLogoField from "./CompanyLogoField";
import OverflowTooltipText from "./OverflowTooltipText";

type JobFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  initialJob: Job | null;
  locations: MasterDataItem[];
  positions: MasterDataItem[];
  techStacks: MasterDataItem[];
  submitting: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: JobFormPayload) => Promise<void> | void;
};

type JobFormDraft = Omit<JobFormPayload, "position_id" | "location_id" | "salary_min" | "salary_max"> & {
  position_id: number | "";
  location_id: number | "";
  salary_min: number | "";
  salary_max: number | "";
  company_logo: File | null;
  remove_company_logo: boolean;
};

const emptyForm: JobFormDraft = {
  company_name: "",
  position_id: "",
  status: "interested",
  work_style: "hybrid",
  employment_type: "full_time",
  salary_min: 4_500_000,
  salary_max: 6_000_000,
  tech_stack_ids: [],
  location_id: "",
  notes: "",
  company_logo: null,
  remove_company_logo: false,
};

function buildFormValues(job: Job | null): JobFormDraft {
  if (!job) return emptyForm;

  return {
    company_name: job.company_name,
    position_id: job.position_id,
    status: job.status,
    work_style: job.work_style,
    employment_type: job.employment_type,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    tech_stack_ids: job.tech_stack_ids,
    location_id: job.location_id,
    notes: job.notes,
    company_logo: null,
    remove_company_logo: false,
  };
}

function parseNumericInput(value: string | number) {
  return value === "" ? "" : Number(value);
}

function normalizeIdList(value: string[] | number[] | string) {
  const values = Array.isArray(value) ? value : value.split(",");
  return values.map((item) => Number(item)).filter((item) => Number.isFinite(item));
}

function toSelectableItems(items: MasterDataItem[], selectedIds: number[]) {
  const selectedIdSet = new Set(selectedIds);
  return items.filter((item) => item.active || selectedIdSet.has(item.id));
}

function formatMasterDataName(item: MasterDataItem) {
  return item.active ? item.name : `${item.name} (${t("master_data.inactive_suffix")})`;
}

function summarizeSelectedTechStacks(techStacks: MasterDataItem[], selectedIds: number[]) {
  return techStacks
    .filter((techStack) => selectedIds.includes(techStack.id))
    .map((techStack) => formatMasterDataName(techStack))
    .join(", ");
}

function toJobFormPayload(values: JobFormDraft): JobFormPayload {
  const payload: JobFormPayload = {
    ...values,
    position_id: Number(values.position_id),
    location_id: Number(values.location_id),
    salary_min: Number(values.salary_min),
    salary_max: Number(values.salary_max),
  };

  if (!values.company_logo) delete payload.company_logo;
  if (!values.remove_company_logo) delete payload.remove_company_logo;

  return payload;
}

function JobFormDrawer({
  open,
  mode,
  initialJob,
  locations,
  positions,
  techStacks,
  submitting,
  submitError,
  onClose,
  onSubmit,
}: JobFormDrawerProps) {
  const [formValues, setFormValues] = useState<JobFormDraft>(emptyForm);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof JobFormDraft, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (open) {
      setFormValues(buildFormValues(initialJob));
      setTouchedFields({});
      setSubmitAttempted(false);
    }
  }, [initialJob, open]);

  const handleChange = <K extends keyof JobFormDraft>(key: K, value: JobFormDraft[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = (key: keyof JobFormDraft) => {
    setTouchedFields((prev) => ({ ...prev, [key]: true }));
  };

  const errors = useMemo(() => {
    const nextErrors: Partial<Record<keyof JobFormDraft, string>> = {};

    if (!formValues.company_name.trim()) nextErrors.company_name = t("validation.required");
    if (!formValues.position_id) nextErrors.position_id = t("validation.required");
    if (!formValues.tech_stack_ids.length) nextErrors.tech_stack_ids = t("validation.required");
    if (!formValues.location_id) nextErrors.location_id = t("validation.required");
    if (formValues.salary_min === "") nextErrors.salary_min = t("validation.required");
    if (formValues.salary_max === "") nextErrors.salary_max = t("validation.required");
    if (typeof formValues.salary_min === "number" && formValues.salary_min < 0) {
      nextErrors.salary_min = t("validation.non_negative");
    }
    if (typeof formValues.salary_max === "number" && formValues.salary_max < 0) {
      nextErrors.salary_max = t("validation.non_negative");
    }
    if (
      typeof formValues.salary_min === "number" &&
      typeof formValues.salary_max === "number" &&
      formValues.salary_max < formValues.salary_min
    ) {
      nextErrors.salary_max = t("validation.salary_range");
    }

    return nextErrors;
  }, [formValues]);

  const isValid = Object.keys(errors).length === 0;
  const getFieldError = (key: keyof JobFormDraft) =>
    submitAttempted || touchedFields[key] ? errors[key] : undefined;
  const selectablePositions = useMemo(
    () => toSelectableItems(positions, formValues.position_id === "" ? [] : [formValues.position_id]),
    [formValues.position_id, positions],
  );
  const selectableLocations = useMemo(
    () => toSelectableItems(locations, formValues.location_id === "" ? [] : [formValues.location_id]),
    [formValues.location_id, locations],
  );
  const selectableTechStacks = useMemo(
    () => toSelectableItems(techStacks, formValues.tech_stack_ids),
    [formValues.tech_stack_ids, techStacks],
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(9, 30, 66, 0.1)" } } }}
    >
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

          <CompanyLogoField
            companyName={formValues.company_name}
            currentLogoUrl={initialJob?.company_logo_url}
            currentLogoFilename={initialJob?.company_logo_filename}
            logoFile={formValues.company_logo}
            removeLogo={formValues.remove_company_logo}
            onLogoChange={(file) => handleChange("company_logo", file)}
            onRemoveLogoChange={(removeLogo) => handleChange("remove_company_logo", removeLogo)}
          />

          <FormControl size="small" error={Boolean(getFieldError("position_id"))}>
            <InputLabel id="job-form-position-label">{t("jobs.form.position")}</InputLabel>
            <Select
              labelId="job-form-position-label"
              label={t("jobs.form.position")}
              value={formValues.position_id || ""}
              onChange={(event) => handleChange("position_id", parseNumericInput(event.target.value))}
              onBlur={() => handleBlur("position_id")}
            >
              {selectablePositions.map((position) => (
                <MenuItem key={position.id} value={position.id}>
                  {formatMasterDataName(position)}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error" sx={{ px: 1.75, pt: 0.5 }}>
              {getFieldError("position_id") ?? " "}
            </Typography>
          </FormControl>

          <FormControl size="small">
            <InputLabel id="job-form-status-label">{t("jobs.form.status")}</InputLabel>
            <Select
              labelId="job-form-status-label"
              label={t("jobs.form.status")}
              value={formValues.status}
              onChange={(event: SelectChangeEvent<string>) => {
                if (isJobStatus(event.target.value)) {
                  handleChange("status", event.target.value);
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

          <FormControl size="small">
            <InputLabel id="job-form-work-style-label">{t("jobs.form.work_style")}</InputLabel>
            <Select
              labelId="job-form-work-style-label"
              label={t("jobs.form.work_style")}
              value={formValues.work_style}
              onChange={(event: SelectChangeEvent<string>) => {
                if (isWorkStyle(event.target.value)) {
                  handleChange("work_style", event.target.value);
                }
              }}
            >
              {WORK_STYLE_OPTIONS.map((workStyle) => (
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
              onChange={(event: SelectChangeEvent<string>) => {
                if (isEmploymentType(event.target.value)) {
                  handleChange("employment_type", event.target.value);
                }
              }}
            >
              {EMPLOYMENT_TYPE_OPTIONS.map((employmentType) => (
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
              onChange={(event) => handleChange("salary_min", parseNumericInput(event.target.value))}
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
              onChange={(event) => handleChange("salary_max", parseNumericInput(event.target.value))}
              onBlur={() => handleBlur("salary_max")}
              size="small"
              required
              error={Boolean(getFieldError("salary_max"))}
              helperText={getFieldError("salary_max")}
            />
          </Stack>

          <FormControl size="small" error={Boolean(getFieldError("tech_stack_ids"))}>
            <InputLabel id="job-form-tech-stacks-label">{t("jobs.form.tech_stack")}</InputLabel>
            <Select
              labelId="job-form-tech-stacks-label"
              multiple
              value={formValues.tech_stack_ids}
              onChange={(event) =>
                handleChange("tech_stack_ids", normalizeIdList(event.target.value))
              }
              onBlur={() => handleBlur("tech_stack_ids")}
              input={<OutlinedInput label={t("jobs.form.tech_stack")} />}
              renderValue={(selected) => (
                <OverflowTooltipText text={summarizeSelectedTechStacks(techStacks, normalizeIdList(selected))} />
              )}
            >
              {selectableTechStacks.map((techStack) => (
                <MenuItem key={techStack.id} value={techStack.id}>
                  <Checkbox checked={formValues.tech_stack_ids.includes(techStack.id)} size="small" />
                  <ListItemText primary={formatMasterDataName(techStack)} />
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error" sx={{ px: 1.75, pt: 0.5 }}>
              {getFieldError("tech_stack_ids") ?? " "}
            </Typography>
          </FormControl>
          <FormControl size="small" error={Boolean(getFieldError("location_id"))}>
            <InputLabel id="job-form-location-label">{t("jobs.form.location")}</InputLabel>
            <Select
              labelId="job-form-location-label"
              label={t("jobs.form.location")}
              value={formValues.location_id || ""}
              onChange={(event) => handleChange("location_id", parseNumericInput(event.target.value))}
              onBlur={() => handleBlur("location_id")}
            >
              {selectableLocations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {formatMasterDataName(location)}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error" sx={{ px: 1.75, pt: 0.5 }}>
              {getFieldError("location_id") ?? " "}
            </Typography>
          </FormControl>
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
                void onSubmit(toJobFormPayload(formValues));
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
