import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import JobDetailDrawer from "./JobDetailDrawer";
import { buildJob } from "../test/fixtures";

const scoringPreference = {
  id: 1,
  full_remote_weight: 30,
  hybrid_weight: 15,
  onsite_weight: 0,
  high_salary_max_threshold: 8_000_000,
  high_salary_bonus: 10,
  low_salary_min_threshold: 4_000_000,
  low_salary_penalty: -10,
  created_at: "2026-04-05T00:00:00.000Z",
  updated_at: "2026-04-05T00:00:00.000Z",
};

const defaultProps = {
  open: true,
  job: buildJob(),
  recommended: false,
  scoringPreference,
  onClose: vi.fn(),
  onStatusChange: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  deleting: false,
};

describe("JobDetailDrawer", () => {
  it("renders the empty state when no job is selected", () => {
    render(<JobDetailDrawer {...defaultProps} job={null} />);

    expect(screen.getByText("求人を選択すると詳細が表示されます。")).toBeInTheDocument();
  });

  it("renders job details and the recommended hint", () => {
    render(<JobDetailDrawer {...defaultProps} recommended />);

    expect(screen.getByText("サンプル会社")).toBeInTheDocument();
    expect(screen.getAllByText("バックエンドエンジニア")).not.toHaveLength(0);
    expect(screen.getByText("現在の条件ではスコアの高い求人です。")).toBeInTheDocument();
    expect(screen.getByText("Ruby on Rails")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("東京")).toBeInTheDocument();
  });

  it("renders the company logo when present", () => {
    render(
      <JobDetailDrawer
        {...defaultProps}
        job={buildJob({ company_name: "ロゴ会社", company_logo_url: "http://localhost:3000/logo.png" })}
      />,
    );

    expect(screen.getByRole("img", { name: "ロゴ会社 ロゴ" })).toBeInTheDocument();
  });

  it("calls the edit, delete, and status-change callbacks", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();

    render(
      <JobDetailDrawer
        {...defaultProps}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "求人を編集" }));
    await user.click(screen.getByRole("button", { name: "削除" }));

    fireEvent.mouseDown(screen.getByLabelText("選考状況"));
    await user.click(await screen.findByRole("option", { name: "内定" }));

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onStatusChange).toHaveBeenCalledWith("offer");
  });
});
