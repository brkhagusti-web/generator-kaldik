import { EffectiveWeekResult, KaldikEvent } from "../types";

const INEFFECTIVE_CATEGORIES = [
  "libur_nasional",
  "libur_semester",
  "mpls",
  "asesmen",
  "rapor",
] as const;

// Hari sekolah: Senin–Sabtu
const SCHOOL_DAYS = [1, 2, 3, 4, 5, 6];

function isSchoolDay(date: Date): boolean {
  return SCHOOL_DAYS.includes(date.getDay());
}

interface WeekInfo {
  weekNumber: number;
  start: Date;
  end: Date;
  affectedEvents: KaldikEvent[];
  affectedDays: number;
}

function normalizeDate(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);

  return normalizeDate(new Date(year, month - 1, day));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return normalizeDate(result);
}

function getWeeksInSemester(
  semesterStart: Date,
  semesterEnd: Date
): WeekInfo[] {
  const weeks: WeekInfo[] = [];

  let current = normalizeDate(semesterStart);
  let weekNumber = 1;

  while (current <= semesterEnd) {
    const dayOfWeek = current.getDay();

    // Senin = 1, Selasa = 2, ..., Sabtu = 6, Minggu = 0
    const daysUntilSunday =
      dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    let weekEnd = addDays(current, daysUntilSunday);

    if (weekEnd > semesterEnd) {
      weekEnd = normalizeDate(semesterEnd);
    }

    weeks.push({
      weekNumber,
      start: new Date(current),
      end: new Date(weekEnd),
      affectedEvents: [],
      affectedDays: 0,
    });

    current = addDays(weekEnd, 1);
    weekNumber++;
  }

  return weeks;
}

function getOverlappingDateRange(
  eventStart: Date,
  eventEnd: Date,
  weekStart: Date,
  weekEnd: Date
): { start: Date; end: Date } | null {
  const overlapStart =
    eventStart > weekStart ? eventStart : weekStart;

  const overlapEnd =
    eventEnd < weekEnd ? eventEnd : weekEnd;

  if (overlapStart > overlapEnd) {
    return null;
  }

  return {
    start: overlapStart,
    end: overlapEnd,
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function calculateEffectiveWeeks(
  events: KaldikEvent[],
  semesterStart: Date,
  semesterEnd: Date,
  semesterName: string
): EffectiveWeekResult {
  const start = normalizeDate(semesterStart);
  const end = normalizeDate(semesterEnd);

  const weeks = getWeeksInSemester(start, end);

  const relevantEvents = events.filter((event) =>
    INEFFECTIVE_CATEGORIES.includes(
      event.category as (typeof INEFFECTIVE_CATEGORIES)[number]
    )
  );

  weeks.forEach((week) => {
    const affectedDateKeys = new Set<string>();
    const weekEvents: KaldikEvent[] = [];

    relevantEvents.forEach((event) => {
      const eventStart = parseDate(event.dateStart);
      const eventEnd = parseDate(event.dateEnd);

      const overlap = getOverlappingDateRange(
        eventStart,
        eventEnd,
        week.start,
        week.end
      );

      if (!overlap) {
        return;
      }

      weekEvents.push(event);

      let current = overlap.start;

      while (current <= overlap.end) {
  if (isSchoolDay(current)) {
    const dateKey = [
      current.getFullYear(),
      String(current.getMonth() + 1).padStart(2, "0"),
      String(current.getDate()).padStart(2, "0"),
    ].join("-");

    affectedDateKeys.add(dateKey);
  }

  current = addDays(current, 1);
}
    });

    week.affectedEvents = weekEvents;
    week.affectedDays = affectedDateKeys.size;
  });

  /*
   * Aturan:
   * 1–2 hari terganggu  = tetap minggu efektif
   * 3 hari atau lebih   = minggu tidak efektif
   */
  const ineffectiveWeeks = weeks.filter(
    (week) => week.affectedDays >= 3
  );

  return {
    semester: semesterName,

    calendarWeeks: weeks.length,

    ineffectiveWeeks: ineffectiveWeeks.length,

    effectiveWeeks:
      weeks.length - ineffectiveWeeks.length,

    ineffectiveDetails: ineffectiveWeeks.map((week) => ({
      week: `Minggu ${week.weekNumber}`,

      dateRange:
        `${formatDate(week.start)} - ${formatDate(week.end)}`,

      affectedDays: week.affectedDays,

      title: week.affectedEvents
        .map((event) => event.title)
        .filter(
          (title, index, array) =>
            array.indexOf(title) === index
        )
        .join(", "),

      category:
        week.affectedEvents[0]?.category ?? "khusus",
    })),
  };
}