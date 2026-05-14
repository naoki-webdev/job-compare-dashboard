import { memo } from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { t } from "../i18n";
import type { Job, ScoringPreference } from "../types/job";
import { buildRadarMetrics } from "../utils/jobDashboardInsights";

type ScoreRadarChartProps = {
  job: Job;
  scoringPreference: ScoringPreference | null;
};

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 74;

function pointAt(index: number, total: number, radius: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function pointsToString(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
}

function ScoreRadarChart({ job, scoringPreference }: ScoreRadarChartProps) {
  const metrics = buildRadarMetrics(job, scoringPreference);
  const gridLevels = [0.33, 0.66, 1];
  const valuePoints = metrics.map((metric, index) =>
    pointAt(index, metrics.length, RADIUS * (metric.value / 100)),
  );

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle2">{t("jobs.detail.radar.title")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("jobs.detail.radar.helper")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            component="svg"
            role="img"
            aria-label={t("jobs.detail.radar.title")}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            sx={{ width: "100%", maxWidth: SIZE, height: "auto" }}
          >
            {gridLevels.map((level) => (
              <polygon
                key={level}
                points={pointsToString(metrics.map((_, index) => pointAt(index, metrics.length, RADIUS * level)))}
                fill="none"
                stroke="rgba(9,30,66,0.16)"
                strokeWidth="1"
              />
            ))}
            {metrics.map((metric, index) => {
              const outer = pointAt(index, metrics.length, RADIUS);
              const label = pointAt(index, metrics.length, RADIUS + 24);
              return (
                <g key={metric.key}>
                  <line
                    x1={CENTER}
                    y1={CENTER}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="rgba(9,30,66,0.12)"
                    strokeWidth="1"
                  />
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor={Math.abs(label.x - CENTER) < 6 ? "middle" : label.x > CENTER ? "start" : "end"}
                    dominantBaseline="middle"
                    fill="#52607a"
                    fontSize="10"
                    fontWeight="700"
                  >
                    {metric.label}
                  </text>
                </g>
              );
            })}
            <polygon
              points={pointsToString(valuePoints)}
              fill="rgba(12,102,228,0.22)"
              stroke="#0c66e4"
              strokeWidth="2"
            />
            {valuePoints.map((point, index) => (
              <circle key={metrics[index].key} cx={point.x} cy={point.y} r="3" fill="#0c66e4" />
            ))}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

export default memo(ScoreRadarChart);
