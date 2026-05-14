import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, createJobDraft } from "../api/jobs";
import { useJobImport } from "./useJobImport";

vi.mock("../api/jobs", async () => {
  const actual = await vi.importActual<typeof import("../api/jobs")>("../api/jobs");
  return {
    ...actual,
    createJobDraft: vi.fn(),
  };
});

const mockedCreateJobDraft = vi.mocked(createJobDraft);

const draftResponse = {
  mode: "rule" as const,
  ai_available: false,
  draft: {
    company_name: "株式会社サンプル",
    source_url: "https://example.com/job",
    salary_min: 6_500_000,
    salary_max: 9_000_000,
    work_style: "full_remote" as const,
    tech_stack_ids: [1, 2],
    tech_stack_names: ["React", "TypeScript"],
    location_id: 3,
    location_name: "東京",
  },
  insights: {
    score_estimate: 82,
    pros: [],
    cons: [],
    questions: [],
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("useJobImport", () => {
  it("analyzes pasted text and stores the draft result", async () => {
    mockedCreateJobDraft.mockResolvedValue(draftResponse);

    const { result } = renderHook(() => useJobImport({ openCreateForm: vi.fn() }));

    act(() => {
      result.current.handleOpenImport();
    });

    expect(result.current.importOpen).toBe(true);

    await act(async () => {
      await result.current.handleAnalyzeImport({ mode: "rule", text: "求人本文", url: "https://example.com/job" });
    });

    expect(mockedCreateJobDraft).toHaveBeenCalledWith({
      mode: "rule",
      text: "求人本文",
      url: "https://example.com/job",
    });
    expect(result.current.importResult).toEqual(draftResponse);
    expect(result.current.importError).toBeNull();
  });

  it("opens the create form with the analyzed draft", async () => {
    mockedCreateJobDraft.mockResolvedValue(draftResponse);
    const openCreateForm = vi.fn();
    const { result } = renderHook(() => useJobImport({ openCreateForm }));

    await act(async () => {
      await result.current.handleAnalyzeImport({ mode: "rule", text: "求人本文", url: "" });
    });

    act(() => {
      result.current.handleConfirmImport();
    });

    expect(result.current.importOpen).toBe(false);
    expect(openCreateForm).toHaveBeenCalledWith({
      company_name: "株式会社サンプル",
      salary_min: 6_500_000,
      salary_max: 9_000_000,
      work_style: "full_remote",
      tech_stack_ids: [1, 2],
      location_id: 3,
      source_url: "https://example.com/job",
    });
  });

  it("shows a user-facing error when analysis fails", async () => {
    mockedCreateJobDraft.mockRejectedValue(new ApiError(422, "invalid", ["求人票本文を入力してください。"]));
    const { result } = renderHook(() => useJobImport({ openCreateForm: vi.fn() }));

    await act(async () => {
      await result.current.handleAnalyzeImport({ mode: "rule", text: "", url: "" });
    });

    expect(result.current.importResult).toBeNull();
    expect(result.current.importError).toBe("求人票本文を入力してください。");
  });
});
