import {
  KaldikEvent,
  MergedEventRange,
  MonthInfo,
  ValidationResult,
} from "../types";

export const INDONESIAN_MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const INDONESIAN_DAY_SHORT = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Min",
];

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  const daysInMonths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonths[monthIndex];
}

/**
  Returns starting column index (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
*/
export function getIndonesianStartDayOfWeek(year: number, monthIndex: number): number {
  const date = new Date(year, monthIndex, 1);
  const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getAcademicYearMonths(
  yearStart: number,
  yearEnd: number,
  monthOrder: "academic" | "calendar" = "academic"
): MonthInfo[] {
  const months: MonthInfo[] = [];

  if (monthOrder === "academic") {
    // July to December (yearStart)
    for (let m = 6; m < 12; m++) {
      months.push({
        monthIndex: m,
        year: yearStart,
        monthNameIndonesian: INDONESIAN_MONTH_NAMES[m],
        daysCount: getDaysInMonth(yearStart, m),
        startDayOfWeek: getIndonesianStartDayOfWeek(yearStart, m),
      });
    }
    // January to June (yearEnd)
    for (let m = 0; m < 6; m++) {
      months.push({
        monthIndex: m,
        year: yearEnd,
        monthNameIndonesian: INDONESIAN_MONTH_NAMES[m],
        daysCount: getDaysInMonth(yearEnd, m),
        startDayOfWeek: getIndonesianStartDayOfWeek(yearEnd, m),
      });
    }
  } else {
    // Calendar Order: Jan -> Dec (yearEnd)
    for (let m = 0; m < 12; m++) {
      const year = m >= 6 ? yearStart : yearEnd;
      months.push({
        monthIndex: m,
        year,
        monthNameIndonesian: INDONESIAN_MONTH_NAMES[m],
        daysCount: getDaysInMonth(year, m),
        startDayOfWeek: getIndonesianStartDayOfWeek(year, m),
      });
    }
  }

  return months;
}

export function formatDateStr(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function getEventsForDate(events: KaldikEvent[], dateStr: string): KaldikEvent[] {
  return events.filter((evt) => {
    return dateStr >= evt.dateStart && dateStr <= evt.dateEnd;
  });
}

/**
 * Merge contiguous events inside a month into chronological formatted display ranges
 * e.g., "14–16 Juli : Masa Pengenalan Lingkungan Sekolah (MPLS)"
 */
export function groupAndMergeEventsForMonth(
  events: KaldikEvent[],
  year: number,
  monthIndex: number
): MergedEventRange[] {
  const daysCount = getDaysInMonth(year, monthIndex);
  const monthStartStr = formatDateStr(year, monthIndex, 1);
  const monthEndStr = formatDateStr(year, monthIndex, daysCount);

  // Filter events active in this month
  const activeEvents = events.filter((evt) => {
    return evt.dateStart <= monthEndStr && evt.dateEnd >= monthStartStr;
  });

  // Sort events chronologically by dateStart
  activeEvents.sort((a, b) => a.dateStart.localeCompare(b.dateStart));

  const result: MergedEventRange[] = [];

  for (const evt of activeEvents) {
    const startObj = new Date(evt.dateStart);
    const endObj = new Date(evt.dateEnd);

    const startDay = startObj.getDate();
    const startMonth = startObj.getMonth();
    const endDay = endObj.getDate();
    const endMonth = endObj.getMonth();

    let displayRange = "";

    if (evt.dateStart === evt.dateEnd) {
      displayRange = `${startDay} ${INDONESIAN_MONTH_NAMES[startMonth]}`;
    } else if (startMonth === endMonth) {
      displayRange = `${startDay}–${endDay} ${INDONESIAN_MONTH_NAMES[startMonth]}`;
    } else {
      displayRange = `${startDay} ${INDONESIAN_MONTH_NAMES[startMonth]}–${endDay} ${INDONESIAN_MONTH_NAMES[endMonth]}`;
    }

    result.push({
      displayDateRange: displayRange,
      title: evt.title,
      category: evt.category,
      rawEvents: [evt],
    });
  }

  return result;
}

/**
 * Automated Validation Check
 */
export function validateCalendarData(
  yearStart: number,
  yearEnd: number,
  events: KaldikEvent[]
): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check year range
  if (yearEnd !== yearStart + 1) {
    errors.push(`Tahun Ajaran ${yearStart}/${yearEnd} tidak berurutan (+1 tahun).`);
  }

  // Check leap year for Feb
  const isLeap = isLeapYear(yearEnd);
  const febDays = getDaysInMonth(yearEnd, 1);
  if (isLeap && febDays !== 29) {
    errors.push(`Tahun ${yearEnd} adalah tahun kabisat, Februari harus 29 hari.`);
  }

  // Check events date formats and years
  events.forEach((evt) => {
    if (!evt.title.trim()) {
      warnings.push(`Terdapat kegiatan tanpa nama (ID: ${evt.id}).`);
    }

    if (evt.dateStart > evt.dateEnd) {
      errors.push(`Kegiatan "${evt.title}": Tanggal mulai (${evt.dateStart}) lebih besar dari tanggal selesai (${evt.dateEnd}).`);
    }

    const startYear = parseInt(evt.dateStart.split("-")[0]);
    if (startYear < yearStart || startYear > yearEnd) {
      warnings.push(`Kegiatan "${evt.title}" (${evt.dateStart}) berada di luar rentang Tahun Ajaran ${yearStart}/${yearEnd}.`);
    }
  });

  // Check essential SD milestones
  const hasMPLS = events.some((e) => e.category === "mpls" || e.title.toLowerCase().includes("mpls") || e.title.toLowerCase().includes("masuk"));
  const hasHUTRI = events.some((e) => e.dateStart.includes("-08-17") || e.title.toLowerCase().includes("kemerdekaan"));
  const hasRapor = events.some((e) => e.category === "rapor" || e.title.toLowerCase().includes("rapor"));

  if (!hasMPLS) warnings.push("Belum ada kegiatan Hari Pertama Masuk / MPLS.");
  if (!hasHUTRI) warnings.push("Belum ada Libur Nasional HUT Kemerdekaan RI (17 Agustus).");
  if (!hasRapor) warnings.push("Belum ada jadwal Pembagian Rapor.");

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    checkedCount: events.length,
  };
}
