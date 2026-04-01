import { memo } from "react";

import Chip from "@mui/material/Chip";

type ScoreChipProps = {
  score: number;
};

function colorByScore(score: number): "success" | "warning" | "default" | "error" {
  if (score >= 50) return "success";
  if (score >= 20) return "warning";
  if (score >= 0) return "default";
  return "error";
}

function ScoreChip({ score }: ScoreChipProps) {
  return <Chip label={score} color={colorByScore(score)} size="small" />;
}

export default memo(ScoreChip);
