export interface ParsedEvent {
  title: string;
  dateStart: string;
  dateEnd: string;
  category: string;
}

const MONTHS: Record<string, string> = {
  januari: "01",
  februari: "02",
  maret: "03",
  april: "04",
  mei: "05",
  juni: "06",
  juli: "07",
  agustus: "08",
  september: "09",
  oktober: "10",
  november: "11",
  desember: "12",
};

const MONTH_NAMES = Object.keys(MONTHS).join("|");

function formatDate(
  day: number,
  monthName: string,
  year: number
): string {
  const month = MONTHS[monthName.toLowerCase()];

  if (!month || day < 1 || day > 31 || year < 2000 || year > 2100) {
    return "";
  }

  const dd = String(day).padStart(2, "0");

  return `${year}-${month}-${dd}`;
}

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[–—−]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function cleanTitle(text: string): string {
  return text
    .replace(/^\s*[-•●▪◦*]+\s*/, "")
    .replace(/^\s*\d+[\s.)-]+/, "")
    .replace(/\s+/g, " ")
    .replace(/\s*[:;,-]\s*$/, "")
    .trim();
}

function detectCategory(title: string): string {
  const text = title.toLowerCase();

  if (
    text.includes("mpls") ||
    text.includes("masa pengenalan lingkungan")
  ) {
    return "mpls";
  }

  if (
    text.includes("sts") ||
    text.includes("sumatif tengah semester") ||
    text.includes("pts") ||
    text.includes("penilaian tengah semester") ||
    text.includes("asesmen tengah semester")
  ) {
    return "asesmen";
  }

  if (
    text.includes("sas") ||
    text.includes("sumatif akhir semester") ||
    text.includes("sumatif akhir tahun") ||
    text.includes("sat") ||
    text.includes("pat") ||
    text.includes("pas") ||
    text.includes("ujian sekolah") ||
    text.includes("asesmen nasional") ||
    text.includes("anbk") ||
    text.includes("asesmen bakat")
  ) {
    return "asesmen";
  }

  if (
    text.includes("rapor") ||
    text.includes("raport") ||
    text.includes("laporan hasil belajar")
  ) {
    return "rapor";
  }

  if (
    text.includes("libur semester") ||
    text.includes("libur akhir semester") ||
    text.includes("libur akhir tahun") ||
    text.includes("libur kenaikan kelas")
  ) {
    return "libur_semester";
  }

  if (
    text.includes("hari kemerdekaan") ||
    text.includes("hari raya") ||
    text.includes("tahun baru") ||
    text.includes("natal") ||
    text.includes("waisak") ||
    text.includes("nyepi") ||
    text.includes("idul fitri") ||
    text.includes("idul adha") ||
    text.includes("isra mi'raj") ||
    text.includes("maulid nabi") ||
    text.includes("hari buruh") ||
    text.includes("hari lahir pancasila") ||
    text.includes("hari kesaktian pancasila") ||
    text.includes("hari pahlawan") ||
    text.includes("hari pendidikan nasional") ||
    text.includes("hari kartini")
  ) {
    return "libur_nasional";
  }

  if (
    text.includes("libur") ||
    text.includes("cuti bersama") ||
    text.includes("tanggal merah")
  ) {
    return "libur_nasional";
  }

  if (
    text.includes("upacara") ||
    text.includes("pentas seni") ||
    text.includes("pesantren") ||
    text.includes("pondok ramadan") ||
    text.includes("ramadan") ||
    text.includes("class meeting") ||
    text.includes("perpisahan") ||
    text.includes("kegiatan sekolah") ||
    text.includes("pembagian tugas") ||
    text.includes("gotong royong") ||
    text.includes("projek")
  ) {
    return "kegiatan_sekolah";
  }

  return "khusus";
}

function parseDateText(
  text: string,
  defaultYear?: number
): string {
  const monthPattern = new RegExp(
    `(\\d{1,2})\\s+(${MONTH_NAMES})\\s*(\\d{4})?`,
    "i"
  );

  const monthMatch = text.match(monthPattern);

  if (monthMatch) {
    const day = Number(monthMatch[1]);
    const month = monthMatch[2];
    const year = monthMatch[3]
      ? Number(monthMatch[3])
      : defaultYear;

    if (year) {
      return formatDate(day, month, year);
    }
  }

  const numericMatch = text.match(
    /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/
  );

  if (numericMatch) {
    const day = Number(numericMatch[1]);
    const month = Number(numericMatch[2]);
    const year = Number(numericMatch[3]);

    if (
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12 &&
      year >= 2000 &&
      year <= 2100
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    }
  }

  return "";
}

function parseDateRange(
  text: string,
  defaultYear?: number
): { dateStart: string; dateEnd: string } | null {
  const monthRange = new RegExp(
    `(\\d{1,2})\\s*-\\s*(\\d{1,2})\\s+(${MONTH_NAMES})\\s*(\\d{4})?`,
    "i"
  );

  const match1 = text.match(monthRange);

  if (match1) {
    const dayStart = Number(match1[1]);
    const dayEnd = Number(match1[2]);
    const month = match1[3];
    const year = match1[4]
      ? Number(match1[4])
      : defaultYear;

    if (year) {
      const dateStart = formatDate(dayStart, month, year);
      const dateEnd = formatDate(dayEnd, month, year);

      if (dateStart && dateEnd) {
        return { dateStart, dateEnd };
      }
    }
  }

  const fullRange = new RegExp(
    `(\\d{1,2})\\s+(${MONTH_NAMES})\\s*(\\d{4})?\\s*-\\s*(\\d{1,2})\\s+(${MONTH_NAMES})\\s*(\\d{4})?`,
    "i"
  );

  const match2 = text.match(fullRange);

  if (match2) {
    const startDay = Number(match2[1]);
    const startMonth = match2[2];
    const startYear = match2[3]
      ? Number(match2[3])
      : defaultYear;

    const endDay = Number(match2[4]);
    const endMonth = match2[5];
    const endYear = match2[6]
      ? Number(match2[6])
      : startYear;

    if (startYear && endYear) {
      const dateStart = formatDate(
        startDay,
        startMonth,
        startYear
      );

      const dateEnd = formatDate(
        endDay,
        endMonth,
        endYear
      );

      if (dateStart && dateEnd) {
        return { dateStart, dateEnd };
      }
    }
  }

  const numericRange = text.match(
    /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\s*-\s*(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/
  );

  if (numericRange) {
    const startDay = Number(numericRange[1]);
    const startMonth = Number(numericRange[2]);
    const startYear = Number(numericRange[3]);

    const endDay = Number(numericRange[4]);
    const endMonth = Number(numericRange[5]);
    const endYear = Number(numericRange[6]);

    const dateStart = `${startYear}-${String(startMonth).padStart(
      2,
      "0"
    )}-${String(startDay).padStart(2, "0")}`;

    const dateEnd = `${endYear}-${String(endMonth).padStart(
      2,
      "0"
    )}-${String(endDay).padStart(2, "0")}`;

    return { dateStart, dateEnd };
  }

  return null;
}

function extractYear(text: string): number | undefined {
  const match = text.match(/\b(20\d{2})\b/);

  return match ? Number(match[1]) : undefined;
}

function findDateInLine(
  line: string,
  defaultYear?: number
): { dateStart: string; dateEnd: string } | null {
  const range = parseDateRange(line, defaultYear);

  if (range) {
    return range;
  }

  const date = parseDateText(line, defaultYear);

  if (date) {
    return {
      dateStart: date,
      dateEnd: date,
    };
  }

  return null;
}

function extractTitle(
  line: string,
  dateInfo: { dateStart: string; dateEnd: string }
): string {
  let title = line;

  const datePatterns = [
    new RegExp(
      `\\d{1,2}\\s*-\\s*\\d{1,2}\\s+(${MONTH_NAMES})\\s*\\d{0,4}`,
      "gi"
    ),
    new RegExp(
      `\\d{1,2}\\s+(${MONTH_NAMES})\\s*\\d{0,4}\\s*-\\s*\\d{1,2}\\s+(${MONTH_NAMES})?\\s*\\d{0,4}`,
      "gi"
    ),
    new RegExp(
      `\\d{1,2}\\s+(${MONTH_NAMES})\\s*\\d{0,4}`,
      "gi"
    ),
    /\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}\s*-\s*\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}/gi,
    /\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}/gi,
  ];

  for (const pattern of datePatterns) {
    title = title.replace(pattern, " ");
  }

  title = title.replace(
    /\b(s\.d\.|s\/d|sd|sampai|hingga)\b/gi,
    " "
  );

  title = cleanTitle(title);

  if (!title) {
    title = "Kegiatan Kalender Pendidikan";
  }

  return title;
}

export function parseKaldik(rawText: string): ParsedEvent[] {
  if (!rawText || typeof rawText !== "string") {
    return [];
  }

  const text = normalizeText(rawText);

  if (!text) {
    return [];
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const events: ParsedEvent[] = [];

  let currentYear: number | undefined;

  for (const line of lines) {
    const detectedYear = extractYear(line);

    if (detectedYear) {
      currentYear = detectedYear;
    }

    const dateInfo = findDateInLine(line, currentYear);

    if (!dateInfo) {
      continue;
    }

    const title = extractTitle(line, dateInfo);

    const category = detectCategory(title);

    events.push({
      title,
      dateStart: dateInfo.dateStart,
      dateEnd: dateInfo.dateEnd,
      category,
    });
  }

  // Menghilangkan event duplikat
  const uniqueEvents = events.filter((event, index, array) => {
    return (
      array.findIndex(
        (item) =>
          item.title.toLowerCase() === event.title.toLowerCase() &&
          item.dateStart === event.dateStart &&
          item.dateEnd === event.dateEnd
      ) === index
    );
  });

  return uniqueEvents;
}