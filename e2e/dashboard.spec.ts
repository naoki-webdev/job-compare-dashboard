import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

async function selectOptionByLabel(container: Locator, page: Page, label: string, option: string) {
  await container.getByLabel(label).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function loginWithCredentials(page: Page, email: string, password: string) {
  await page.goto("/");
  await page.getByRole("textbox", { name: "メールアドレス" }).fill(email);
  await page.getByLabel("パスワード").fill(password);
  // LoginPage には「デモユーザーでログイン」と「ログイン」の2ボタンがあるので exact 指定で submit のみを取る。
  await page.getByRole("button", { name: "ログイン", exact: true }).click();
  await expect(page.getByRole("heading", { name: "AI求人診断ダッシュボード" })).toBeVisible();
}

async function login(page: Page) {
  // CRUD 系E2Eは read_only でない通常ユーザーで実行する（デモユーザーは read_only=true で書き込み不可）。
  await loginWithCredentials(page, "e2e@example.com", "password");
}

async function loginAsDemo(page: Page) {
  await loginWithCredentials(page, "demo@example.com", "password");
  await expect(page.getByText("デモユーザーで閲覧中")).toBeVisible();
}

async function authHeaders(page: Page) {
  const token = await page.evaluate(() => window.localStorage.getItem("job-compare-auth-token"));
  expect(token).toBeTruthy();
  return { Authorization: `Bearer ${token}` };
}

test.describe("jobs dashboard", () => {
  test.describe.configure({ mode: "serial" });

  test("shows seeded jobs in the dashboard list", async ({ page }) => {
    await login(page);

    await expect(page.getByRole("heading", { name: "AI求人診断ダッシュボード" })).toBeVisible();
    await expect(page.getByText("サンプル会社 1", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "求人一覧", level: 5 })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "会社名" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "スコア" })).toBeVisible();
  });

  test("keeps read-only demo users from writing data through the UI and API", async ({ page }) => {
    await loginAsDemo(page);

    await expect(page.getByRole("button", { name: "新規求人を追加" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "求人本文から取り込み" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "スコア設定" })).not.toBeVisible();

    const headers = await authHeaders(page);
    const beforeResponse = await page.request.get("/api/jobs?per_page=1", { headers });
    expect(beforeResponse.ok()).toBeTruthy();
    const beforeBody = await beforeResponse.json();
    const targetJob = beforeBody.jobs[0];
    const beforeTotal = beforeBody.meta.total_count;
    const beforeStatus = targetJob.status;

    const createResponse = await page.request.post("/api/jobs", {
      headers,
      data: {
        job: {
          company_name: "Read Only E2E Company",
          position_id: targetJob.position_id,
          status: "interested",
          work_style: targetJob.work_style,
          employment_type: targetJob.employment_type,
          salary_min: targetJob.salary_min,
          salary_max: targetJob.salary_max,
          tech_stack_ids: targetJob.tech_stack_ids,
          location_id: targetJob.location_id,
          notes: "read-only E2E",
        },
      },
    });
    expect(createResponse.status()).toBe(403);

    const updateResponse = await page.request.patch(`/api/jobs/${targetJob.id}`, {
      headers,
      data: { job: { status: beforeStatus === "offer" ? "interested" : "offer" } },
    });
    expect(updateResponse.status()).toBe(403);

    const deleteResponse = await page.request.delete(`/api/jobs/${targetJob.id}`, { headers });
    expect(deleteResponse.status()).toBe(403);

    const afterResponse = await page.request.get("/api/jobs?per_page=1", { headers });
    expect(afterResponse.ok()).toBeTruthy();
    const afterBody = await afterResponse.json();
    expect(afterBody.meta.total_count).toBe(beforeTotal);
    expect(afterBody.jobs[0].id).toBe(targetJob.id);
    expect(afterBody.jobs[0].status).toBe(beforeStatus);
  });

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

  test("creates a new job from the form drawer", async ({ page }) => {
    await login(page);

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
    await expect(
      page
        .getByRole("row")
        .filter({ has: page.getByText(companyName, { exact: true }) })
        .first(),
    ).toBeVisible();
  });

  test("creates a job from the rule-based import drawer without calling Gemini", async ({ page }) => {
    await login(page);

    const companyName = "株式会社AI取込E2E";
    await page.getByRole("button", { name: "求人本文から取り込み" }).first().click();

    const importDrawer = page
      .locator(".MuiDrawer-paper")
      .filter({ has: page.getByRole("heading", { name: "求人本文から取り込み" }) });

    await expect(importDrawer.getByText("構造化された求人データ")).toBeVisible();
    await importDrawer.getByLabel("求人URL（任意・保存用）").fill("https://example.com/e2e-import");
    await importDrawer.getByLabel("求人票本文（必須・解析対象）").fill(`
${companyName}
勤務地: 東京
年収: 650万円〜900万円
技術: Ruby on Rails, React, TypeScript
自社サービスの開発チームです。チーム体制と評価制度を確認したいです。
    `.trim());

    await importDrawer.getByRole("button", { name: "解析する" }).click();

    await expect(importDrawer.getByText(companyName, { exact: true }).last()).toBeVisible();
    await expect(importDrawer.getByText(/React/).last()).toBeVisible();
    await expect(importDrawer.getByText("東京", { exact: true }).last()).toBeVisible();
    await expect(importDrawer.getByText("ルールベース判定")).toBeVisible();

    await importDrawer.getByRole("button", { name: "この内容で新規作成" }).click();

    const formDrawer = page
      .locator(".MuiDrawer-paper")
      .filter({ has: page.getByRole("heading", { name: "求人を新規作成" }) });

    await expect(formDrawer.getByLabel("会社名")).toHaveValue(companyName);
    await expect(formDrawer.getByLabel("年収下限")).toHaveValue("6500000");
    await expect(formDrawer.getByLabel("年収上限")).toHaveValue("9000000");
    await expect(formDrawer.getByLabel("求人URL")).toHaveValue("https://example.com/e2e-import");
    await expect(formDrawer.getByLabel("技術スタック")).toContainText("React");
    await expect(formDrawer.getByLabel("勤務地")).toContainText("東京");

    await selectOptionByLabel(formDrawer, page, "職種", "フルスタックエンジニア");
    await formDrawer.getByRole("button", { name: "保存" }).click();

    await expect(formDrawer).not.toBeVisible();
    await expect(
      page
        .getByRole("row")
        .filter({ has: page.getByText(companyName, { exact: true }) })
        .first(),
    ).toBeVisible();
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

  test("updates a job status from the detail drawer", async ({ page }) => {
    await login(page);

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
    await login(page);

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
    await login(page);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "CSV出力" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^jobs-\d+\.csv$/);
  });

  test("updates master data from the settings drawer", async ({ page }) => {
    await login(page);

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
