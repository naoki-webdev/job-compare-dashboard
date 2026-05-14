import { Suspense, lazy } from "react";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useAuth } from "../auth/AuthContext";
import AiDiagnosisOverview from "../components/AiDiagnosisOverview";
import DashboardSummary from "../components/DashboardSummary";
import JobFilters from "../components/JobFilters";
import JobTable from "../components/JobTable";
import PageLoader from "../components/PageLoader";
import { useJobsDashboard } from "../hooks/useJobsDashboard";
import { t } from "../i18n";

const JobDetailDrawer = lazy(() => import("../components/JobDetailDrawer"));
const JobFormDrawer = lazy(() => import("../components/JobFormDrawer"));
const JobImportDrawer = lazy(() => import("../components/JobImportDrawer"));
const MasterDataDrawer = lazy(() => import("../components/MasterDataDrawer"));

export default function JobsPage() {
  const { user, signOut } = useAuth();
  const readOnly = user?.read_only ?? false;
  const {
    jobs,
    locations,
    selectedJob,
    positions,
    techStacks,
    positiveKeywords,
    negativeKeywords,
    interviewQuestions,
    drawerOpen,
    formOpen,
    formMode,
    formInitialDraft,
    importOpen,
    importLoading,
    importResult,
    importError,
    masterDataOpen,
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
    submittingMasterData,
    error,
    formError,
    scoringError,
    masterDataError,
    scoringPreference,
    summaryItems,
    recommendedJobIds,
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
    handleOpenMasterData,
    handleCloseMasterData,
    handleOpenImport,
    handleCloseImport,
    handleAnalyzeImport,
    handleConfirmImport,
    handleStatusChange,
    handleSubmitForm,
    handleDeleteJob,
    handleSubmitScoring,
    handleCreateLocation,
    handleUpdateLocation,
    handleDeleteLocation,
    handleCreatePosition,
    handleUpdatePosition,
    handleDeletePosition,
    handleCreateTechStack,
    handleUpdateTechStack,
    handleDeleteTechStack,
    handleCreatePositiveKeyword,
    handleUpdatePositiveKeyword,
    handleDeletePositiveKeyword,
    handleCreateNegativeKeyword,
    handleUpdateNegativeKeyword,
    handleDeleteNegativeKeyword,
    handleCreateInterviewQuestion,
    handleUpdateInterviewQuestion,
    handleDeleteInterviewQuestion,
    handleExportCsv,
  } = useJobsDashboard();

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4.5 } }}>
      <Stack spacing={2.5}>
        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 5,
            border: "1px solid rgba(9,30,66,0.12)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,251,252,0.98) 100%), radial-gradient(circle at top right, rgba(56,139,255,0.12), transparent 32%)",
            boxShadow: "0 1px 2px rgba(9,30,66,0.04), 0 12px 28px rgba(9,30,66,0.06)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              alignItems: "stretch",
            }}
          >
            <Stack spacing={1.5}>
              <Stack spacing={0.75}>
                <Typography
                  variant="h3"
                  sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, fontWeight: 800, lineHeight: 1.08 }}
                >
                  {t("app.title")}
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 760, color: "text.secondary", lineHeight: 1.7 }}>
                  {t("app.subtitle")}
                </Typography>
                <Typography variant="body2" sx={{ maxWidth: 760, color: "text.secondary", lineHeight: 1.7 }}>
                  {t("app.score_message")}
                </Typography>
              </Stack>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, md: 1.75 },
                borderRadius: 3,
                backgroundColor: "rgba(244,245,247,0.82)",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
              >
                <Box sx={{ flexShrink: 0, minWidth: { sm: 180 } }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {t("auth.current_user")}
                    </Typography>
                    {readOnly && (
                      <Chip size="small" color="warning" variant="outlined" label={t("auth.read_only_badge")} />
                    )}
                  </Stack>
                  <Typography variant="body2" fontWeight={700}>
                    {user?.name}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  justifyContent={{ xs: "stretch", sm: "flex-end" }}
                  sx={{
                    flex: 1,
                    "& .MuiButton-root": {
                      minWidth: { xs: "100%", sm: 144 },
                      minHeight: 36,
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  {!readOnly && (
                    <Button variant="contained" onClick={() => handleOpenCreateForm()}>
                      {t("actions.create_job")}
                    </Button>
                  )}
                  {!readOnly && (
                    <Button variant="outlined" color="primary" onClick={handleOpenImport}>
                      {t("actions.import_job")}
                    </Button>
                  )}
                  {!readOnly && (
                    <Button variant="outlined" onClick={handleOpenMasterData}>
                      {t("actions.edit_settings")}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => { void signOut(); }}
                    sx={{
                      backgroundColor: "#1f2937",
                      boxShadow: "none",
                      color: "#fff",
                      fontWeight: 700,
                      "&:hover": {
                        backgroundColor: "#111827",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {t("auth.sign_out")}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Paper>

        {readOnly && (
          <Alert severity="info" variant="outlined">
            <AlertTitle>{t("auth.read_only_banner_title")}</AlertTitle>
            {t("auth.read_only_banner_body")}
          </Alert>
        )}

        <AiDiagnosisOverview
          jobs={jobs}
          totalCount={totalCount}
          summaryItems={summaryItems}
          readOnly={readOnly}
          onImport={handleOpenImport}
          onSelectJob={(jobId) => {
            void handleRowClick(jobId);
          }}
        />

        <DashboardSummary items={summaryItems} />

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 5,
            backgroundColor: "rgba(255,255,255,0.96)",
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "flex-end" }}
            >
              <Box sx={{ maxWidth: 720 }}>
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  {t("jobs.section_title")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("jobs.section_description")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("jobs.section_subdescription")}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ borderColor: "rgba(9,30,66,0.1)" }} />

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
            recommendedJobIds={recommendedJobIds}
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
            recommended={selectedJob ? recommendedJobIds.includes(selectedJob.id) : false}
            scoringPreference={scoringPreference}
            readOnly={readOnly}
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
            initialDraft={formMode === "create" ? formInitialDraft : null}
            locations={locations}
            positions={positions}
            techStacks={techStacks}
            submitting={submittingForm}
            submitError={formError}
            onClose={handleCloseForm}
            onSubmit={handleSubmitForm}
          />
        </Suspense>
      )}

      {importOpen && (
        <Suspense fallback={null}>
          <JobImportDrawer
            open={importOpen}
            readOnly={readOnly}
            aiEnabled={user?.ai_enabled ?? false}
            result={importResult}
            loading={importLoading}
            error={importError}
            onClose={handleCloseImport}
            onAnalyze={handleAnalyzeImport}
            onConfirm={handleConfirmImport}
          />
        </Suspense>
      )}

      {masterDataOpen && (
        <Suspense fallback={null}>
          <MasterDataDrawer
            open={masterDataOpen}
            locations={locations}
            positions={positions}
            techStacks={techStacks}
            positiveKeywords={positiveKeywords}
            negativeKeywords={negativeKeywords}
            interviewQuestions={interviewQuestions}
            preference={scoringPreference}
            submittingScoring={submittingScoring}
            submittingMasterData={submittingMasterData}
            scoringError={scoringError}
            masterDataError={masterDataError}
            onClose={handleCloseMasterData}
            onSubmitScoring={handleSubmitScoring}
            onCreateLocation={handleCreateLocation}
            onUpdateLocation={handleUpdateLocation}
            onDeleteLocation={handleDeleteLocation}
            onCreatePosition={handleCreatePosition}
            onUpdatePosition={handleUpdatePosition}
            onDeletePosition={handleDeletePosition}
            onCreateTechStack={handleCreateTechStack}
            onUpdateTechStack={handleUpdateTechStack}
            onDeleteTechStack={handleDeleteTechStack}
            onCreatePositiveKeyword={handleCreatePositiveKeyword}
            onUpdatePositiveKeyword={handleUpdatePositiveKeyword}
            onDeletePositiveKeyword={handleDeletePositiveKeyword}
            onCreateNegativeKeyword={handleCreateNegativeKeyword}
            onUpdateNegativeKeyword={handleUpdateNegativeKeyword}
            onDeleteNegativeKeyword={handleDeleteNegativeKeyword}
            onCreateInterviewQuestion={handleCreateInterviewQuestion}
            onUpdateInterviewQuestion={handleUpdateInterviewQuestion}
            onDeleteInterviewQuestion={handleDeleteInterviewQuestion}
          />
        </Suspense>
      )}
    </Container>
  );
}
