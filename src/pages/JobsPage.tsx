import { Suspense, lazy } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import DashboardSummary from "../components/DashboardSummary";
import JobFilters from "../components/JobFilters";
import JobTable from "../components/JobTable";
import PageLoader from "../components/PageLoader";
import { useJobsDashboard } from "../hooks/useJobsDashboard";
import { t } from "../i18n";

const JobDetailDrawer = lazy(() => import("../components/JobDetailDrawer"));
const JobFormDrawer = lazy(() => import("../components/JobFormDrawer"));
const ScoringPreferenceDrawer = lazy(() => import("../components/ScoringPreferenceDrawer"));

export default function JobsPage() {
  const {
    jobs,
    selectedJob,
    drawerOpen,
    formOpen,
    formMode,
    scoringOpen,
    keyword,
    statuses,
    workStyles,
    sort,
    direction,
    page,
    perPage,
    totalCount,
    loading,
    submittingForm,
    deletingJob,
    submittingScoring,
    error,
    formError,
    scoringError,
    scoringPreference,
    summaryItems,
    handleKeywordChange,
    handleStatusesChange,
    handleWorkStylesChange,
    handleSortChange,
    handlePageChange,
    handlePerPageChange,
    handleClearFilters,
    handleRowClick,
    handleCloseDrawer,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleCloseForm,
    handleOpenScoring,
    handleCloseScoring,
    handleStatusChange,
    handleSubmitForm,
    handleDeleteJob,
    handleSubmitScoring,
    handleExportCsv,
  } = useJobsDashboard();

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            color: "#0f172a",
            background:
              "radial-gradient(circle at top left, rgba(112,185,255,0.18), transparent 28%), linear-gradient(135deg, #ffffff 0%, #f6f9ff 55%, #f5fbf8 100%)",
            border: "1px solid rgba(31,111,235,0.12)",
            boxShadow: "0 16px 40px rgba(15,23,42,0.06)",
          }}
        >
          <Stack spacing={1}>
            <Typography variant="overline" sx={{ letterSpacing: "0.1em", color: "primary.main", fontWeight: 700 }}>
              Portfolio Demo
            </Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 800, lineHeight: 1.15 }}>
              {t("app.title")}
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 760, color: "text.secondary" }}>
              {t("app.subtitle")}
            </Typography>
          </Stack>
        </Paper>

        <DashboardSummary items={summaryItems} />

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography variant="h6">{t("jobs.section_title")}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("jobs.section_description")}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={handleOpenScoring}>
                  {t("actions.edit_scoring")}
                </Button>
                <Button variant="contained" color="secondary" onClick={handleOpenCreateForm}>
                  {t("actions.create_job")}
                </Button>
              </Stack>
            </Stack>

            <Divider />

            <JobFilters
              keyword={keyword}
              statuses={statuses}
              workStyles={workStyles}
              totalCount={totalCount}
              onKeywordChange={handleKeywordChange}
              onStatusesChange={handleStatusesChange}
              onWorkStylesChange={handleWorkStylesChange}
              onClearFilters={handleClearFilters}
              onExportCsv={handleExportCsv}
            />
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <PageLoader />
        ) : (
          <JobTable
            jobs={jobs}
            page={page}
            perPage={perPage}
            totalCount={totalCount}
            sort={sort}
            direction={direction}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onRowClick={handleRowClick}
          />
        )}
      </Stack>

      {drawerOpen && (
        <Suspense fallback={null}>
          <JobDetailDrawer
            open={drawerOpen}
            job={selectedJob}
            onClose={handleCloseDrawer}
            onStatusChange={handleStatusChange}
            onEdit={handleOpenEditForm}
            onDelete={handleDeleteJob}
            deleting={deletingJob}
          />
        </Suspense>
      )}

      {formOpen && (
        <Suspense fallback={null}>
          <JobFormDrawer
            open={formOpen}
            mode={formMode}
            initialJob={formMode === "edit" ? selectedJob : null}
            submitting={submittingForm}
            submitError={formError}
            onClose={handleCloseForm}
            onSubmit={handleSubmitForm}
          />
        </Suspense>
      )}

      {scoringOpen && (
        <Suspense fallback={null}>
          <ScoringPreferenceDrawer
            open={scoringOpen}
            preference={scoringPreference}
            submitting={submittingScoring}
            submitError={scoringError}
            onClose={handleCloseScoring}
            onSubmit={handleSubmitScoring}
          />
        </Suspense>
      )}
    </Container>
  );
}
