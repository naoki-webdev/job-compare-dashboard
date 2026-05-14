import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { buildJob } from "../test/fixtures";
import AiDiagnosisOverview from "./AiDiagnosisOverview";

const summaryItems = [
  { key: "total" as const, value: 3, caption: "現在の検索条件に一致する求人件数" },
  { key: "remote_friendly" as const, value: 2, caption: "フルリモート・ハイブリッドの合計" },
  { key: "active_pipeline" as const, value: 2, caption: "気になる・応募済み・面接中の合計" },
  { key: "high_score" as const, value: 2, caption: "スコア50以上の件数" },
];

describe("AiDiagnosisOverview", () => {
  it("renders the diagnosis flow and ranking", () => {
    render(
      <AiDiagnosisOverview
        jobs={[
          buildJob({ id: 1, company_name: "A社", score: 58 }),
          buildJob({ id: 2, company_name: "B社", score: 86 }),
        ]}
        totalCount={3}
        summaryItems={summaryItems}
        readOnly={false}
        onImport={vi.fn()}
        onSelectJob={vi.fn()}
      />,
    );

    expect(screen.getByText("求人票を貼るだけで、応募優先度を自動判定")).toBeInTheDocument();
    expect(screen.getByText("求人票入力")).toBeInTheDocument();
    expect(screen.getByText("AI抽出結果")).toBeInTheDocument();
    expect(screen.getByText("応募優先度ランキング")).toBeInTheDocument();
    expect(screen.getByText("B社")).toBeInTheDocument();
  });

  it("opens import and selected ranking jobs from the panel", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    const onSelectJob = vi.fn();

    render(
      <AiDiagnosisOverview
        jobs={[buildJob({ id: 9, company_name: "選択対象", score: 92 })]}
        totalCount={1}
        summaryItems={summaryItems}
        readOnly={false}
        onImport={onImport}
        onSelectJob={onSelectJob}
      />,
    );

    await user.click(screen.getByRole("button", { name: "求人本文から取り込み" }));
    await user.click(screen.getByRole("button", { name: /選択対象/ }));

    expect(onImport).toHaveBeenCalledOnce();
    expect(onSelectJob).toHaveBeenCalledWith(9);
  });

  it("hides the import action for read-only users", () => {
    render(
      <AiDiagnosisOverview
        jobs={[]}
        totalCount={0}
        summaryItems={summaryItems}
        readOnly
        onImport={vi.fn()}
        onSelectJob={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "求人本文から取り込み" })).not.toBeInTheDocument();
  });
});
