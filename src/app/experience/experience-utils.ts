import type { Experience } from "./types";

function getCompletedMonths(startDate: string, endDate: Date): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  let months =
    (endDate.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    endDate.getUTCMonth() -
    start.getUTCMonth();

  if (endDate.getUTCDate() < start.getUTCDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

export function formatExperienceDuration(
  experience: Pick<Experience, "start_date" | "end_date" | "is_current">,
  today = new Date(),
): string {
  const endDate = experience.is_current
    ? new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
    : new Date(`${experience.end_date}T00:00:00Z`);
  const months = getCompletedMonths(experience.start_date, endDate);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0 && remainingMonths === 0) {
    return "Less than a month";
  }

  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  }

  if (remainingMonths > 0) {
    parts.push(
      `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`,
    );
  }

  return parts.join(" ");
}

export function formatExperienceDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
