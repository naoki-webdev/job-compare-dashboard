import type { ReactNode } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { t } from "../i18n";

type AppShellProps = {
  children: ReactNode;
  userName?: string;
  readOnly: boolean;
  onCreateJob: () => void;
  onImportJob: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
};

export default function AppShell({
  children,
  userName,
  readOnly,
  onCreateJob,
  onImportJob,
  onOpenSettings,
  onSignOut,
}: AppShellProps) {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          color: "text.primary",
          backgroundColor: "rgba(255,255,255,0.92)",
          borderBottom: "1px solid rgba(9,30,66,0.12)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 1px 2px rgba(9,30,66,0.04)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, py: 1 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 1.25, md: 2 }}
              alignItems={{ xs: "stretch", md: "center" }}
              sx={{ width: "100%" }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #0c66e4 0%, #1f845a 100%)",
                  }}
                >
                  AI
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="h1" variant="subtitle1" fontWeight={900} noWrap>
                    {t("app.title")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    {t("app.shell_caption")}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                component="nav"
                direction="row"
                spacing={0.75}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  "& .MuiButton-root": {
                    minHeight: 34,
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <Button
                  variant="text"
                  color="primary"
                  aria-current="page"
                  sx={{
                    px: 1.5,
                    fontWeight: 800,
                    backgroundColor: "rgba(12,102,228,0.08)",
                    "&:hover": { backgroundColor: "rgba(12,102,228,0.12)" },
                  }}
                >
                  {t("navigation.jobs")}
                </Button>
                {!readOnly && (
                  <Button variant="text" color="inherit" onClick={onOpenSettings} sx={{ px: 1.5 }}>
                    {t("navigation.settings")}
                  </Button>
                )}
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
                justifyContent={{ xs: "space-between", md: "flex-end" }}
              >
                {!readOnly && (
                  <Button variant="contained" size="small" onClick={onCreateJob}>
                    {t("actions.create_job")}
                  </Button>
                )}
                {!readOnly && (
                  <Button variant="outlined" size="small" onClick={onImportJob}>
                    {t("actions.import_job")}
                  </Button>
                )}
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box sx={{ minWidth: 0, textAlign: "right" }}>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                      {t("auth.current_user")}
                    </Typography>
                    <Typography variant="body2" fontWeight={800} noWrap>
                      {userName ?? t("common.no_data")}
                    </Typography>
                  </Box>
                  {readOnly && (
                    <Chip size="small" color="warning" variant="outlined" label={t("auth.read_only_badge")} />
                  )}
                </Stack>
                <Button variant="outlined" color="inherit" size="small" onClick={onSignOut}>
                  {t("auth.sign_out")}
                </Button>
              </Stack>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {children}
    </Box>
  );
}
