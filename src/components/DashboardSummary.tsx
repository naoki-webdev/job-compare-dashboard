import { memo } from "react";

import Box from "@mui/material/Box";
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
        <Box
          key={item.key}
          sx={{
            px: 2,
            py: 1.75,
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.82)",
            border: "1px solid rgba(15,23,42,0.08)",
          }}
        >
          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
              {t(`summary.${item.key}`)}
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {item.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.caption}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

export default memo(DashboardSummary);
