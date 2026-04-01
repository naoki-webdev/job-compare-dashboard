import { memo } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";

import { t } from "../i18n";
import type { Job, JobSortKey, SortDirection } from "../types/job";
import { formatDateTime, formatSalaryRange } from "../utils/jobFormat";
import ScoreChip from "./ScoreChip";

type JobTableProps = {
  jobs: Job[];
  page: number;
  perPage: number;
  totalCount: number;
  sort: JobSortKey;
  direction: SortDirection;
  onSortChange: (sort: JobSortKey, direction: SortDirection) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onRowClick: (jobId: number) => void;
};

const columns: Array<{ key: JobSortKey; labelKey: string }> = [
  { key: "company_name", labelKey: "jobs.table.company" },
  { key: "position", labelKey: "jobs.table.position" },
  { key: "status", labelKey: "jobs.table.status" },
  { key: "work_style", labelKey: "jobs.table.work_style" },
  { key: "salary_max", labelKey: "jobs.table.salary" },
  { key: "score", labelKey: "jobs.table.score" },
  { key: "updated_at", labelKey: "jobs.table.updated_at" },
];

function JobTable({
  jobs,
  page,
  perPage,
  totalCount,
  sort,
  direction,
  onSortChange,
  onPageChange,
  onPerPageChange,
  onRowClick,
}: JobTableProps) {
  const handleSort = (key: JobSortKey) => {
    const nextDirection: SortDirection = sort === key && direction === "asc" ? "desc" : "asc";
    onSortChange(key, nextDirection);
  };

  if (jobs.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          px: 4,
          py: 6,
          borderRadius: 4,
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,248,255,0.95))",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h6">{t("jobs.empty")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("jobs.empty_hint")}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 18px 50px rgba(15,23,42,0.06)" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(31,111,235,0.05)" }}>
              {columns.map((column) => (
                <TableCell key={column.key} sx={{ py: 1.5, fontWeight: 700 }}>
                  <TableSortLabel
                    active={sort === column.key}
                    direction={sort === column.key ? direction : "asc"}
                    onClick={() => handleSort(column.key)}
                  >
                    {t(column.labelKey)}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow
                key={job.id}
                hover
                sx={{
                  cursor: "pointer",
                  "&:last-child td": { borderBottom: 0 },
                  "&:hover": { backgroundColor: "rgba(31,111,235,0.04)" },
                }}
                onClick={() => onRowClick(job.id)}
              >
                <TableCell sx={{ py: 1.75, minWidth: 180 }}>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={700}>
                      {job.company_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{job.id}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ minWidth: 180 }}>{job.position}</TableCell>
                <TableCell>{t(`enums.job_status.${job.status}`)}</TableCell>
                <TableCell>{t(`enums.work_style.${job.work_style}`)}</TableCell>
                <TableCell>{formatSalaryRange(job.salary_min, job.salary_max)}</TableCell>
                <TableCell>
                  <ScoreChip score={job.score} />
                </TableCell>
                <TableCell>{formatDateTime(job.updated_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        rowsPerPageOptions={[10, 20, 50]}
        count={totalCount}
        rowsPerPage={perPage}
        page={Math.max(page - 1, 0)}
        onPageChange={(_event, nextPage) => onPageChange(nextPage + 1)}
        onRowsPerPageChange={(event) => onPerPageChange(Number(event.target.value))}
        sx={{
          borderTop: "1px solid rgba(15,23,42,0.08)",
          backgroundColor: "rgba(248,250,252,0.92)",
        }}
      />
    </Paper>
  );
}

export default memo(JobTable);
