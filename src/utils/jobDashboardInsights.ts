import { t } from "../i18n";
import type { Job, ScoringPreference } from "../types/job";
import { buildScoreBreakdown } from "./scoreBreakdown";

export type PriorityLevel = "high" | "review" | "hold";

export type PriorityView = {
  level: PriorityLevel;
  label: string;
  color: "success" | "warning" | "default";
};

export type RadarMetric = {
  key: string;
  label: string;
  value: number;
};

export type JobDecisionInsights = {
  strengths: string[];
  checks: string[];
};

const STATUS_PROGRESS: Record<Job["status"], number> = {
  interested: 35,
  applied: 55,
  interviewing: 78,
  offer: 100,
  rejected: 12,
};

const WORK_STYLE_BASE: Record<Job["work_style"], number> = {
  full_remote: 100,
  hybrid: 74,
  onsite: 42,
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getPriorityView(score: number): PriorityView {
  if (score >= 70) {
    return { level: "high", label: t("decision.priority.high"), color: "success" };
  }

  if (score >= 50) {
    return { level: "review", label: t("decision.priority.review"), color: "warning" };
  }

  return { level: "hold", label: t("decision.priority.hold"), color: "default" };
}

export function getTopScoredJobs(jobs: Job[], limit = 3) {
  return [...jobs].sort((left, right) => right.score - left.score).slice(0, limit);
}

export function calculateRate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return clampPercent((numerator / denominator) * 100);
}

export function buildRadarMetrics(job: Job, preference: ScoringPreference | null): RadarMetric[] {
  const techScore = job.tech_stacks.reduce((sum, techStack) => sum + Math.max(techStack.score_weight, 0), 0);
  const workWeights = preference
    ? [preference.full_remote_weight, preference.hybrid_weight, preference.onsite_weight].map((value) => Math.max(value, 0))
    : [];
  const maxWorkWeight = Math.max(...workWeights, 0);
  const currentWorkWeight = preference
    ? Math.max(
        job.work_style === "full_remote"
          ? preference.full_remote_weight
          : job.work_style === "hybrid"
            ? preference.hybrid_weight
            : preference.onsite_weight,
        0,
      )
    : 0;

  const workStyleFit = maxWorkWeight > 0
    ? clampPercent((currentWorkWeight / maxWorkWeight) * 100)
    : WORK_STYLE_BASE[job.work_style];

  const salaryFit = (() => {
    if (!preference) return 60;
    if (job.salary_max >= preference.high_salary_max_threshold) return 100;
    if (job.salary_min < preference.low_salary_min_threshold) return 38;
    return 72;
  })();

  return [
    { key: "score", label: t("jobs.detail.radar.score"), value: clampPercent(job.score) },
    { key: "work_style", label: t("jobs.detail.radar.work_style"), value: workStyleFit },
    { key: "salary", label: t("jobs.detail.radar.salary"), value: salaryFit },
    { key: "tech_stack", label: t("jobs.detail.radar.tech_stack"), value: clampPercent(techScore * 2.4) },
    {
      key: "role_location",
      label: t("jobs.detail.radar.role_location"),
      value: clampPercent(Math.max(job.position_master.score_weight, 0) * 5 + Math.max(job.location_master.score_weight, 0) * 4),
    },
    { key: "progress", label: t("jobs.detail.radar.progress"), value: STATUS_PROGRESS[job.status] },
  ];
}

export function buildJobDecisionInsights(job: Job, preference: ScoringPreference | null): JobDecisionInsights {
  const breakdown = buildScoreBreakdown(job, preference);
  const strengths = breakdown
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
    .map((item) => item.label)
    .slice(0, 5);
  const checks = breakdown
    .filter((item) => item.value < 0)
    .sort((left, right) => left.value - right.value)
    .map((item) => item.label)
    .slice(0, 5);

  return { strengths, checks };
}
