import { describe, expect, it } from "vitest";

import { ApiError, buildJobsExportUrl, getApiErrorMessage } from "./jobs";

describe("buildJobsExportUrl", () => {
  it("builds an export url with the current filters", () => {
    const url = buildJobsExportUrl({
      keyword: "Rails",
      status: ["interested", "applied"],
      work_style: ["full_remote"],
      sort: "score",
      direction: "desc",
      page: 2,
      per_page: 50,
    });

    expect(url).toBe(
      "http://localhost:3000/api/jobs/export?keyword=Rails&status=interested%2Capplied&work_style=full_remote&sort=score&direction=desc&page=2&per_page=50",
    );
  });

  it("omits the query string when there are no filters", () => {
    expect(buildJobsExportUrl()).toBe("http://localhost:3000/api/jobs/export");
  });
});

describe("getApiErrorMessage", () => {
  it("uses API validation and authorization messages when present", () => {
    const error = new ApiError(403, "Forbidden", [ "公開デモではデータの追加・更新・削除はできません。" ]);

    expect(getApiErrorMessage(error, "保存に失敗しました。")).toBe(
      "公開デモではデータの追加・更新・削除はできません。",
    );
  });

  it("falls back to the provided message when the API error has no details", () => {
    const error = new ApiError(500, "Internal Server Error");

    expect(getApiErrorMessage(error, "保存に失敗しました。")).toBe("保存に失敗しました。");
  });
});
