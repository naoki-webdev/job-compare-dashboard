import { memo } from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { t } from "../i18n";

type SummaryItem = {
  key: "total" | "remote_friendly" | "active_pipeline" | "high_score";
  value: number;
  caption: string;
};

type DashboardSummaryProps = {
  items: SummaryItem[];
};

function DashboardSummary({ items }: DashboardSummaryProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
      }}
    >
      {items.map((item) => (
        <Paper
          variant="outlined"
          key={item.key}
          sx={{
            px: 2.25,
            py: 2,
            borderRadius: 4,
            position: "relative",
            overflow: "hidden",
            backgroundColor: "rgba(255,255,255,0.96)",
            "&::before": {
              content: '""',
              position: "absolute",
              insetInline: 0,
              top: 0,
              height: 4,
              background:
                item.key === "total"
                  ? "#0c66e4"
                  : item.key === "remote_friendly"
                    ? "#1f845a"
                    : item.key === "active_pipeline"
                      ? "#6554c0"
                      : "#b65c02",
            },
          }}
        >
          <Stack spacing={0.4}>
            <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.08em" }}>
              {t(`summary.${item.key}`)}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.05 }}>
              {item.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
              {item.caption}
            </Typography>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

export default memo(DashboardSummary);
