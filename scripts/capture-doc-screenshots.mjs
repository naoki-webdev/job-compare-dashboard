import { chromium } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";
const email = process.env.E2E_EMAIL ?? "e2e@example.com";
const password = process.env.E2E_PASSWORD ?? "password";
const viewportPreset = process.env.SCREENSHOT_VIEWPORT ?? "desktop";
const viewportPresets = {
  desktop: { width: 1440, height: 980 },
  mobile: { width: 390, height: 844 },
};
const viewportName = viewportPreset in viewportPresets ? viewportPreset : "desktop";
const viewport = viewportPresets[viewportName];
const filenameSuffix = viewportName === "desktop" ? "" : `-${viewportName}`;

async function save(page, name) {
  await page.waitForTimeout(350);
  await page.screenshot({
    path: `docs/screenshots/${name}${filenameSuffix}.jpg`,
    type: "jpeg",
    quality: 82,
    fullPage: false,
  });
}

async function login(page) {
  await page.goto(baseURL);
  await page.getByRole("textbox", { name: "メールアドレス" }).fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "ログイン", exact: true }).click();
  await page.getByRole("heading", { name: "AI求人診断ダッシュボード" }).waitFor();
  await page.getByText("サンプル会社 1", { exact: true }).waitFor();
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });

try {
  await page.goto(baseURL);
  await save(page, "login");

  await login(page);
  await save(page, "dashboard-list");

  await page.getByRole("row").filter({ has: page.getByText("サンプル会社 1", { exact: true }) }).first().click();
  await page.getByText("比較レーダー").waitFor();
  await save(page, "dashboard-detail");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "新規求人を追加" }).click();
  await page.getByRole("heading", { name: "求人を新規作成" }).waitFor();
  await save(page, "dashboard-form");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "求人本文から取り込み" }).first().click();
  await page.getByText("構造化された求人データ").waitFor();
  await save(page, "job-import-input");

  await page.getByLabel("求人票本文（必須・解析対象）").fill(`
会社名: 株式会社サンプルテック
職種: フルスタックエンジニア
勤務地: リモート
年収: 650万円〜900万円
技術: Ruby on Rails, React, TypeScript
自社サービスの開発チームで、チーム体制と評価制度を確認したい求人です。
  `.trim());
  await page.getByRole("button", { name: "解析する" }).click();
  await page.getByText("抽出された求人情報").waitFor();
  await save(page, "job-import-result");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "スコア設定" }).click();
  await page.getByRole("heading", { name: "スコア設定" }).waitFor();
  await page.getByText("評価キーワード（加点）").scrollIntoViewIfNeeded();
  await save(page, "dashboard-settings");
} finally {
  await browser.close();
}
