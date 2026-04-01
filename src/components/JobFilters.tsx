import { memo } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { t } from "../i18n";
import type { JobStatus, WorkStyle } from "../types/job";

type JobFiltersProps = {
  keyword: string;
  statuses: JobStatus[];
  workStyles: WorkStyle[];
  totalCount: number;
  onKeywordChange: (value: string) => void;
  onStatusesChange: (values: JobStatus[]) => void;
  onWorkStylesChange: (values: WorkStyle[]) => void;
  onClearFilters: () => void;
  onExportCsv: () => void;
};

const statusOptions: JobStatus[] = ["interested", "applied", "interviewing", "offer", "rejected"];
const workStyleOptions: WorkStyle[] = ["full_remote", "hybrid", "onsite"];

function JobFilters({
  keyword,
  statuses,
  workStyles,
  totalCount,
  onKeywordChange,
  onStatusesChange,
  onWorkStylesChange,
  onClearFilters,
  onExportCsv,
}: JobFiltersProps) {
  const activeFilterCount = statuses.length + workStyles.length + (keyword.trim() ? 1 : 0);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(180px, 1fr) minmax(180px, 1fr) auto" },
          alignItems: "start",
        }}
      >
        <TextField
          label={t("filters.keyword")}
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={t("filters.keyword_placeholder")}
          size="small"
        />

        <FormControl size="small">
          <InputLabel id="status-filter-label">{t("filters.status")}</InputLabel>
          <Select
            labelId="status-filter-label"
            multiple
            value={statuses}
            onChange={(event) => onStatusesChange(event.target.value as JobStatus[])}
            input={<OutlinedInput label={t("filters.status")} />}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {t(`enums.job_status.${option}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="work-style-filter-label">{t("filters.work_style")}</InputLabel>
          <Select
            labelId="work-style-filter-label"
            multiple
            value={workStyles}
            onChange={(event) => onWorkStylesChange(event.target.value as WorkStyle[])}
            input={<OutlinedInput label={t("filters.work_style")} />}
          >
            {workStyleOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {t(`enums.work_style.${option}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          alignItems="center"
          justifyContent="flex-end"
          sx={{ flexWrap: "nowrap", whiteSpace: "nowrap" }}
        >
          <Button variant="text" onClick={onClearFilters}>
            {t("actions.clear_filters")}
          </Button>
          <Button variant="outlined" onClick={onExportCsv}>
            {t("actions.export_csv")}
          </Button>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        <Chip
          color="primary"
          variant="outlined"
          label={t("filters.result_summary", { count: totalCount, total: totalCount })}
        />
        {activeFilterCount > 0 && <Chip color="secondary" variant="outlined" label={`絞り込み ${activeFilterCount}件`} />}
      </Stack>
    </Stack>
  );
}

export default memo(JobFilters);
