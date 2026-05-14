import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { JobDraftResponse } from "../types/job";
import JobImportDrawer from "./JobImportDrawer";

const result: JobDraftResponse = {
  mode: "ai",
  ai_available: true,
  draft: {
    company_name: "診断サンプル社",
    source_url: "https://example.com/jobs/1",
    salary_min: 5_000_000,
    salary_max: 8_000_000,
    work_style: "hybrid",
    tech_stack_ids: [1],
    tech_stack_names: ["React"],
    location_id: 1,
    location_name: "東京",
  },
  insights: {
    score_estimate: 82,
    pros: ["React"],
    cons: [],
    questions: ["チーム体制"],
  },
};

describe("JobImportDrawer", () => {
  it("renders the before and after import layout", () => {
    render(
      <JobImportDrawer
        open
        aiEnabled
        readOnly={false}
        result={result}
        loading={false}
        error={null}
        onClose={vi.fn()}
        onAnalyze={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("求人票入力")).toBeInTheDocument();
    expect(screen.getByText("構造化された求人データ")).toBeInTheDocument();
    expect(screen.getByText("診断サンプル社")).toBeInTheDocument();
    expect(screen.getByText("AI判定 (Gemini)")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("shows an empty after state before analysis", () => {
    render(
      <JobImportDrawer
        open
        aiEnabled={false}
        readOnly={false}
        result={null}
        loading={false}
        error={null}
        onClose={vi.fn()}
        onAnalyze={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText(/求人票本文を解析すると/)).toBeInTheDocument();
  });
});
