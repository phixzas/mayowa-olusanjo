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

function formatMonths(months: number): string {
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

export function formatExperienceDuration(
  experience: Pick<Experience, "start_date" | "end_date" | "is_current">,
  today = new Date(),
): string {
  const endDate = experience.is_current || !experience.end_date
    ? new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
    : new Date(`${experience.end_date}T00:00:00Z`);

  return formatMonths(getCompletedMonths(experience.start_date, endDate));
}

export function formatTotalExperienceDuration(
  experiences: Pick<Experience, "start_date" | "end_date" | "is_current">[],
  today = new Date(),
): string {
  const todayDate = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const todayString = todayDate.toISOString().slice(0, 10);
  const ranges = experiences.flatMap((experience) => {
    const endDateString =
      experience.is_current || !experience.end_date
        ? todayString
        : experience.end_date;
    const startDate = new Date(`${experience.start_date}T00:00:00Z`);
    const endDate = new Date(`${endDateString}T00:00:00Z`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate < startDate
    ) {
      return [];
    }

    return [{ startDate: experience.start_date, start: startDate, end: endDate }];
  });

  ranges.sort((left, right) => left.start.getTime() - right.start.getTime());

  const mergedRanges: typeof ranges = [];
  for (const range of ranges) {
    const previous = mergedRanges[mergedRanges.length - 1];
    if (
      previous &&
      range.start.getTime() <= previous.end.getTime() + 24 * 60 * 60 * 1000
    ) {
      if (range.end > previous.end) {
        previous.end = range.end;
      }
    } else {
      mergedRanges.push({ ...range });
    }
  }

  const totalMonths = mergedRanges.reduce(
    (total, range) => total + getCompletedMonths(range.startDate, range.end),
    0,
  );
  return formatMonths(totalMonths);
}

export function formatExperienceDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
