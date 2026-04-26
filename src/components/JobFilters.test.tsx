import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import JobFilters from "./JobFilters";

const defaultProps = {
  keyword: "",
  statuses: [] as [],
  workStyles: [] as [],
  totalCount: 40,
  onKeywordChange: vi.fn(),
  onStatusesChange: vi.fn(),
  onWorkStylesChange: vi.fn(),
  onClearFilters: vi.fn(),
  onExportCsv: vi.fn(),
};

describe("JobFilters", () => {
  it("renders keyword input, status/work-style selects, and action buttons", () => {
    render(<JobFilters {...defaultProps} />);

    expect(screen.getByRole("textbox", { name: "キーワード" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "選考状況" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "働き方" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "絞り込みをクリア" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CSV出力" })).toBeInTheDocument();
  });

  it("displays the result summary chip", () => {
    render(<JobFilters {...defaultProps} totalCount={25} />);
    expect(screen.getByText("25件表示 / 全25件")).toBeInTheDocument();
  });

  it("shows the active filter count chip when filters are applied", () => {
    render(<JobFilters {...defaultProps} statuses={["interested", "applied"]} workStyles={["full_remote"]} />);
    expect(screen.getByText("絞り込み 3件")).toBeInTheDocument();
  });

  it("does not show the active filter chip when no filters are applied", () => {
    render(<JobFilters {...defaultProps} />);
    expect(screen.queryByText(/絞り込み \d+件/)).not.toBeInTheDocument();
  });

  it("calls onKeywordChange when typing in the keyword field", async () => {
    const onKeywordChange = vi.fn();
    const user = userEvent.setup();
    render(<JobFilters {...defaultProps} onKeywordChange={onKeywordChange} />);

    await user.type(screen.getByRole("textbox", { name: "キーワード" }), "Rails");
    expect(onKeywordChange).toHaveBeenCalled();
  });

  it("calls onClearFilters when the clear button is clicked", async () => {
    const onClearFilters = vi.fn();
    const user = userEvent.setup();
    render(<JobFilters {...defaultProps} onClearFilters={onClearFilters} />);

    await user.click(screen.getByText("絞り込みをクリア"));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it("calls onExportCsv when the export button is clicked", async () => {
    const onExportCsv = vi.fn();
    const user = userEvent.setup();
    render(<JobFilters {...defaultProps} onExportCsv={onExportCsv} />);

    await user.click(screen.getByText("CSV出力"));
    expect(onExportCsv).toHaveBeenCalledOnce();
  });

  it("counts keyword as an active filter when present", () => {
    render(<JobFilters {...defaultProps} keyword="React" />);
    expect(screen.getByText("絞り込み 1件")).toBeInTheDocument();
  });
});
