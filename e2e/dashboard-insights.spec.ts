import { expect, test } from "@playwright/test";

import { login } from "./helpers/dashboard";

test.describe("jobs dashboard insights", () => {
  test("shows the ranking and decision panels on the dashboard and detail drawer", async ({ page }) => {
    await login(page);

    await expect(page.getByRole("heading", { name: "応募優先度ランキング" })).toBeVisible();

    await page.getByRole("button", { name: /サンプル会社/ }).first().click();

    const detailDrawer = page
      .locator(".MuiDrawer-paper")
      .filter({ has: page.getByText("比較レーダー") });

    await expect(detailDrawer.getByText("比較レーダー")).toBeVisible();
    await expect(detailDrawer.getByText("応募判断")).toBeVisible();
    await expect(detailDrawer.getByText("加点要素")).toBeVisible();
    await expect(detailDrawer.getByText("確認ポイント")).toBeVisible();
  });

  test("filters the job list by keyword and can clear the filter", async ({ page }) => {
    await login(page);

    const keywordField = page.getByRole("textbox", { name: "キーワード" });

    await keywordField.fill("サンプル会社 12");

    await expect(
      page
        .getByRole("row")
        .filter({ has: page.getByText("サンプル会社 12", { exact: true }) })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByRole("row")
        .filter({ has: page.getByText("サンプル会社 1", { exact: true }) })
        .first(),
    ).not.toBeVisible();

    await page.getByRole("button", { name: "絞り込みをクリア" }).click();

    await expect(
      page
        .getByRole("row")
        .filter({ has: page.getByText("サンプル会社 1", { exact: true }) })
        .first(),
    ).toBeVisible();
  });

  test("starts a CSV export download", async ({ page }) => {
    await login(page);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "CSV出力" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^jobs-\d+\.csv$/);
  });
});
