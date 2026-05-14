import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { buildJob } from "../test/fixtures";
import AiDiagnosisOverview from "./AiDiagnosisOverview";

describe("AiDiagnosisOverview", () => {
  it("renders the diagnosis flow and ranking", () => {
    render(
      <AiDiagnosisOverview
        jobs={[
          buildJob({ id: 1, company_name: "A社", score: 58 }),
          buildJob({ id: 2, company_name: "B社", score: 86 }),
        ]}
        onSelectJob={vi.fn()}
      />,
    );

    expect(screen.getByText("求人票を貼るだけで、応募優先度を自動判定")).toBeInTheDocument();
    expect(screen.getByText("求人票入力")).toBeInTheDocument();
    expect(screen.getByText("AI抽出結果")).toBeInTheDocument();
    expect(screen.getByText("応募優先度ランキング")).toBeInTheDocument();
    expect(screen.getByText("B社")).toBeInTheDocument();
  });

  it("opens selected ranking jobs from the panel", async () => {
    const user = userEvent.setup();
    const onSelectJob = vi.fn();

    render(
      <AiDiagnosisOverview
        jobs={[buildJob({ id: 9, company_name: "選択対象", score: 92 })]}
        onSelectJob={onSelectJob}
      />,
    );

    await user.click(screen.getByRole("button", { name: /選択対象/ }));

    expect(onSelectJob).toHaveBeenCalledWith(9);
  });

  it("does not render a duplicated import action", () => {
    render(
      <AiDiagnosisOverview
        jobs={[]}
        onSelectJob={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "求人本文から取り込み" })).not.toBeInTheDocument();
  });
});
