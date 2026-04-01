import { t } from "../i18n";

export function formatSalaryRange(min: number, max: number) {
  return t("jobs.salary_range", {
    min: min.toLocaleString("ja-JP"),
    max: max.toLocaleString("ja-JP"),
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ja-JP");
}
