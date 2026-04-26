import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildJob } from "../test/fixtures";
import type { JobFormPayload } from "../types/job";
import { useJobsList } from "./useJobsList";
import {
  ApiError,
  buildJobsExportUrl,
  createJob,
  deleteJob,
  fetchJob,
  fetchJobs,
  updateJob,
} from "../api/jobs";

vi.mock("../api/jobs", async () => {
  const actual = await vi.importActual<typeof import("../api/jobs")>("../api/jobs");

  return {
    ...actual,
    buildJobsExportUrl: vi.fn(),
    createJob: vi.fn(),
    deleteJob: vi.fn(),
    fetchJob: vi.fn(),
    fetchJobs: vi.fn(),
    updateJob: vi.fn(),
  };
});

const mockedBuildJobsExportUrl = vi.mocked(buildJobsExportUrl);
const mockedCreateJob = vi.mocked(createJob);
const mockedDeleteJob = vi.mocked(deleteJob);
const mockedFetchJob = vi.mocked(fetchJob);
const mockedFetchJobs = vi.mocked(fetchJobs);
const mockedUpdateJob = vi.mocked(updateJob);

const response = {
  jobs: [buildJob(), buildJob({ id: 2, company_name: "別の会社", score: 48 })],
  meta: {
    page: 1,
    per_page: 20,
    total_count: 2,
    summary: {
      remote_friendly: 2,
      active_pipeline: 1,
      high_score: 1,
    },
  },
};

const payload: JobFormPayload = {
  company_name: "株式会社テスト",
  position_id: 1,
  status: "interested",
  work_style: "hybrid",
  employment_type: "full_time",
  salary_min: 5_000_000,
  salary_max: 7_000_000,
  tech_stack_ids: [1, 2],
  location_id: 1,
  notes: "テスト用メモ",
};

beforeEach(() => {
  mockedFetchJobs.mockResolvedValue(response);
  mockedFetchJob.mockResolvedValue(buildJob());
  mockedCreateJob.mockResolvedValue(buildJob({ id: 3, company_name: "株式会社テスト" }));
  mockedUpdateJob.mockResolvedValue(buildJob({ status: "offer" }));
  mockedDeleteJob.mockResolvedValue(undefined);
  mockedBuildJobsExportUrl.mockReturnValue("/api/jobs/export?sort=score");
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("useJobsList", () => {
  it("loads jobs and updates list state", async () => {
    const { result } = renderHook(() => useJobsList());

    await act(async () => {
      await result.current.loadJobs();
    });

    expect(mockedFetchJobs).toHaveBeenCalledWith({
      keyword: "",
      status: [],
      work_style: [],
      sort: "score",
      direction: "desc",
      page: 1,
      per_page: 20,
    });
    expect(result.current.jobs).toHaveLength(2);
    expect(result.current.totalCount).toBe(2);
    expect(result.current.summaryItems[1].value).toBe(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("stores an error when loading jobs fails", async () => {
    mockedFetchJobs.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useJobsList());

    await act(async () => {
      await result.current.loadJobs();
    });

    expect(result.current.error).toBe("求人一覧の取得に失敗しました。");
    expect(result.current.loading).toBe(false);
  });

  it("creates a job and reloads the list", async () => {
    const { result } = renderHook(() => useJobsList());

    act(() => {
      result.current.handleOpenCreateForm();
    });

    await act(async () => {
      await result.current.handleSubmitForm(payload);
    });

    expect(mockedCreateJob).toHaveBeenCalledWith(payload);
    expect(mockedFetchJobs).toHaveBeenCalledTimes(1);
    expect(result.current.formOpen).toBe(false);
    expect(result.current.formError).toBeNull();
  });

  it("updates a selected job from the edit form and reopens the detail drawer", async () => {
    const selectedJob = buildJob({ id: 9, company_name: "編集対象" });
    const updatedJob = buildJob({ id: 9, company_name: "編集対象", status: "offer", score: 88 });
    mockedUpdateJob.mockResolvedValueOnce(updatedJob);

    const { result } = renderHook(() => useJobsList());

    act(() => {
      result.current.openJobPreview(selectedJob);
    });

    act(() => {
      result.current.handleOpenEditForm();
    });

    await act(async () => {
      await result.current.handleSubmitForm(payload);
    });

    expect(mockedUpdateJob).toHaveBeenCalledWith(9, payload);
    expect(result.current.selectedJob?.status).toBe("offer");
    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.formOpen).toBe(false);
  });

  it("surfaces API validation errors from form submit", async () => {
    mockedCreateJob.mockRejectedValueOnce(new ApiError(422, "Company name can't be blank", ["Company name can't be blank"]));

    const { result } = renderHook(() => useJobsList());

    act(() => {
      result.current.handleOpenCreateForm();
    });

    await act(async () => {
      await result.current.handleSubmitForm(payload);
    });

    expect(result.current.formError).toBe("Company name can't be blank");
  });

  it("deletes the selected job and clears the current selection", async () => {
    const selectedJob = buildJob({ id: 11, company_name: "削除対象" });
    const { result } = renderHook(() => useJobsList());

    act(() => {
      result.current.openJobPreview(selectedJob);
      result.current.handleOpenCreateForm();
    });

    await act(async () => {
      await result.current.handleDeleteJob();
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedDeleteJob).toHaveBeenCalledWith(11);
    expect(mockedFetchJobs).toHaveBeenCalledTimes(1);
    expect(result.current.selectedJob).toBeNull();
    expect(result.current.drawerOpen).toBe(false);
    expect(result.current.formOpen).toBe(false);
  });

  it("exports the current filter params as a CSV URL", () => {
    const { result } = renderHook(() => useJobsList());

    act(() => {
      result.current.handleKeywordChange("Rails");
    });

    act(() => {
      result.current.handleExportCsv();
    });

    expect(mockedBuildJobsExportUrl).toHaveBeenCalledWith({
      keyword: "Rails",
      status: [],
      work_style: [],
      sort: "score",
      direction: "desc",
      page: 1,
      per_page: 20,
    });
    expect(window.open).toHaveBeenCalledWith("/api/jobs/export?sort=score", "_blank", "noopener,noreferrer");
  });
});
