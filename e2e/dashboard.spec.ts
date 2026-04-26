import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

async function selectOptionByLabel(container: Locator, page: Page, label: string, option: string) {
  await container.getByLabel(label).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test.describe("jobs dashboard", () => {
  test.describe.configure({ mode: "serial" });

  test("shows seeded jobs in the dashboard list", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "求人比較ダッシュボード" })).toBeVisible();
    await expect(page.getByText("サンプル会社 1", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "求人一覧", level: 5 })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "会社名" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "スコア" })).toBeVisible();
  });

  test("creates a new job from the form drawer", async ({ page }) => {
    await page.goto("/");

    const companyName = "E2E確認用会社";

    await page.getByRole("button", { name: "新規求人を追加" }).click();

    const formDrawer = page
      .locator(".MuiDrawer-paper")
      .filter({ has: page.getByRole("heading", { name: "求人を新規作成" }) });

    await expect(formDrawer.getByRole("heading", { name: "求人を新規作成" })).toBeVisible();
    await formDrawer.getByLabel("会社名").fill(companyName);
    await selectOptionByLabel(formDrawer, page, "職種", "テックリード");
    await selectOptionByLabel(formDrawer, page, "働き方", "フルリモート");
    await selectOptionByLabel(formDrawer, page, "雇用形態", "正社員");
    await formDrawer.getByLabel("年収下限").fill("8000000");
    await formDrawer.getByLabel("年収上限").fill("9500000");

    await formDrawer.getByLabel("技術スタック").click();
    await page.getByRole("option", { name: "Ruby on Rails", exact: true }).click();
    await page.getByRole("option", { name: "TypeScript", exact: true }).click();
    await page.getByRole("option", { name: "React", exact: true }).click();
    await page.keyboard.press("Escape");

    await selectOptionByLabel(formDrawer, page, "勤務地", "リモート");
    await formDrawer.getByLabel("メモ").fill("Playwright で作成した求人です。");
    await formDrawer.getByRole("button", { name: "保存" }).click();

    await expect(formDrawer).not.toBeVisible();
    await expect(page.getByText(companyName, { exact: true })).toBeVisible();
  });

  test("filters the job list by keyword and can clear the filter", async ({ page }) => {
    await page.goto("/");

    const keywordField = page.getByRole("textbox", { name: "キーワード" });

    await keywordField.fill("サンプル会社 12");

    await expect(page.getByText("サンプル会社 12", { exact: true })).toBeVisible();
    await expect(page.getByText("サンプル会社 1", { exact: true })).not.toBeVisible();

    await page.getByRole("button", { name: "絞り込みをクリア" }).click();

    await expect(page.getByText("サンプル会社 1", { exact: true })).toBeVisible();
  });

  test("updates a job status from the detail drawer", async ({ page }) => {
    await page.goto("/");

    const targetRow = page
      .getByRole("row")
      .filter({ has: page.getByText("サンプル会社 1", { exact: true }) })
      .first();

    await targetRow.click();

    const detailDrawer = page
      .locator(".MuiDrawer-paper")
      .filter({ has: page.getByRole("button", { name: "求人を編集" }) });

    await expect(detailDrawer.getByRole("button", { name: "求人を編集" })).toBeVisible();
    await detailDrawer.getByLabel("選考状況").click();
    await page.getByRole("option", { name: "内定", exact: true }).click();

    await expect(detailDrawer.getByLabel("選考状況")).toContainText("内定");

    await page.keyboard.press("Escape");
    await expect(detailDrawer).not.toBeVisible();
    await expect(
      page
        .getByRole("row")
        .filter({ has: page.getByText("サンプル会社 1", { exact: true }) })
        .first(),
    ).toContainText("内定");
  });

  test("deletes a job from the detail drawer", async ({ page }) => {
    await page.goto("/");

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    const targetRow = page
      .getByRole("row")
      .filter({ has: page.getByText("サンプル会社 40", { exact: true }) })
      .first();

    await targetRow.click();

    const detailDrawer = page
      .locator(".MuiDrawer-paper")
      .filter({ has: page.getByRole("button", { name: "求人を編集" }) });

    await detailDrawer.getByRole("button", { name: "削除" }).click();

    await expect(detailDrawer).not.toBeVisible();
    await expect(page.getByText("サンプル会社 40", { exact: true })).not.toBeVisible();
  });

  test("starts a CSV export download", async ({ page }) => {
    await page.goto("/");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "CSV出力" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^jobs-\d+\.csv$/);
  });

  test("updates master data from the settings drawer", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "スコア設定" }).click();

    const settingsDrawer = page
      .locator(".MuiDrawer-paper")
      .filter({ has: page.getByRole("heading", { name: "スコア設定" }) });

    const positionNameInput = settingsDrawer.getByLabel("職種名").first();
    const positionCard = positionNameInput.locator("xpath=ancestor::div[.//button[normalize-space()='保存']][1]");
    const updatedName = "バックエンドエンジニア E2E";

    await positionNameInput.fill(updatedName);
    await positionCard.getByRole("button", { name: "保存" }).click();

    await expect(positionNameInput).toHaveValue(updatedName);
  });
});
