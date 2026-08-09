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

  if (
    !month ||
    day < 1 ||
    day > 31 ||
    year < 2000 ||
    year > 2100
  ) {
    return "";
  }

  return `${year}-${month}-${String(day).padStart(2, "0")}`;
}

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[–—−]/g, "-")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function cleanTitle(text: string): string {
  return text
    .replace(/^[\s•●▪◦*-]+/, "")
    .replace(/^\s*\d+[\s.)-]+/, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s:;,\-]+|[\s:;,\-]+$/g, "")
    .trim();
}

function detectCategory(title: string): string {
  const text = title.toLowerCase();

  // Cuti bersama harus diperiksa terlebih dahulu.
  if (
    text.includes("cuti bersama") ||
    text.includes("cuti bersama nasional")
  ) {
    return "cuti_bersama";
  }

  // Libur semester
  if (
    text.includes("libur semester") ||
    text.includes("libur akhir semester") ||
    text.includes("libur akhir tahun") ||
    text.includes("libur kenaikan kelas") ||
    text.includes("libur setelah rapor")
  ) {
    return "libur_semester";
  }

  // MPLS / awal tahun ajaran
  if (
    text.includes("mpls") ||
    text.includes("masa pengenalan lingkungan sekolah") ||
    text.includes("hari pertama masuk") ||
    text.includes("awal masuk sekolah")
  ) {
    return "mpls";
  }

  // Asesmen
  if (
    text.includes("sts") ||
    text.includes("pts") ||
    text.includes("sumatif tengah semester") ||
    text.includes("penilaian tengah semester") ||
    text.includes("asesmen tengah semester") ||
    text.includes("sas") ||
    text.includes("sat") ||
    text.includes("pas") ||
    text.includes("pat") ||
    text.includes("sumatif akhir semester") ||
    text.includes("sumatif akhir tahun") ||
    text.includes("penilaian akhir semester") ||
    text.includes("penilaian akhir tahun") ||
    text.includes("asesmen akhir semester") ||
    text.includes("asesmen akhir tahun") ||
    text.includes("asesmen nasional") ||
    text.includes("anbk") ||
    text.includes("asesmen bakat") ||
    text.includes("ujian sekolah") ||
    text.includes("ujian akhir")
  ) {
    return "asesmen";
  }

  // Pembagian rapor
  if (
    text.includes("rapor") ||
    text.includes("raport") ||
    text.includes("pembagian hasil belajar") ||
    text.includes("laporan hasil belajar")
  ) {
    return "rapor";
  }

  // Hari libur nasional / keagamaan
  if (
    text.includes("libur nasional") ||
    text.includes("libur awal puasa") ||
    text.includes("tahun baru") ||
    text.includes("imlek") ||
    text.includes("nyepi") ||
    text.includes("idul fitri") ||
    text.includes("idul adha") ||
    text.includes("isra mi") ||
    text.includes("maulid nabi") ||
    text.includes("wafat yesus") ||
text.includes("wafat isa al masih") ||
text.includes("wafat isa almasih") ||
    text.includes("kenaikan yesus") ||
text.includes("kenaikan isa al masih") ||
text.includes("kenaikan isa almasih") ||
    text.includes("kelahiran yesus") ||
    text.includes("natal") ||
    text.includes("waisak") ||
    text.includes("hari buruh") ||
    text.includes("hari lahir pancasila") ||
    text.includes("proklamasi kemerdekaan") ||
    text.includes("kemerdekaan republik indonesia") ||
    text.includes("hari kemerdekaan") ||
    text.includes("hari pahlawan") ||
    text.includes("hari pendidikan nasional") ||
    text.includes("hari kartini") ||
    text.includes("hari kesaktian pancasila") ||
    text.includes("tanggal merah") ||
    text.includes("hari raya")
  ) {
    return "libur_nasional";
  }

  // Kegiatan sekolah
  if (
    text.includes("upacara") ||
    text.includes("pentas seni") ||
    text.includes("pesantren") ||
    text.includes("pondok ramadan") ||
    text.includes("ramadan") ||
    text.includes("class meeting") ||
    text.includes("perpisahan") ||
    text.includes("gotong royong") ||
    text.includes("projek") ||
    text.includes("proyek") ||
    text.includes("kegiatan sekolah") ||
    text.includes("pembagian tugas") ||
    text.includes("matsama") ||
    text.includes("kegiatan kokurikuler") ||
    text.includes("kokurikuler")
  ) {
    return "kegiatan_sekolah";
  }

  return "khusus";
}

function extractYear(text: string): number | undefined {
  const matches = text.match(/\b20\d{2}\b/g);

  if (!matches || matches.length === 0) {
    return undefined;
  }

  return Number(matches[0]);
}

function parseSingleDate(
  text: string,
  defaultYear?: number
): string {
  // Contoh:
  // 17 Agustus 2026
  // 17 Agustus
  const monthMatch = text.match(
    new RegExp(
      `(\\d{1,2})\\s+(${MONTH_NAMES})\\s*(20\\d{2})?`,
      "i"
    )
  );

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

  // Contoh:
  // 17/08/2026
  // 17-08-2026
  // 17.08.2026
  const numericMatch = text.match(
    /(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d{2})/
  );

  if (numericMatch) {
    const day = Number(numericMatch[1]);
    const month = Number(numericMatch[2]);
    const year = Number(numericMatch[3]);

    if (
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12
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
  // ---------------------------------------------------------
  // FORMAT:
  // 14-16 Juli 2026
  // 14 s.d. 16 Juli 2026
  // 14 sampai 16 Juli 2026
  // ---------------------------------------------------------
  const sameMonthRange = new RegExp(
    `(\\d{1,2})\\s*(?:-|s\\.d\\.?|s/d|sd|sampai|hingga)\\s*(\\d{1,2})\\s+(${MONTH_NAMES})\\s*(20\\d{2})?`,
    "i"
  );

  const sameMonthMatch = text.match(sameMonthRange);

  if (sameMonthMatch) {
    const startDay = Number(sameMonthMatch[1]);
    const endDay = Number(sameMonthMatch[2]);
    const month = sameMonthMatch[3];
    const year = sameMonthMatch[4]
      ? Number(sameMonthMatch[4])
      : defaultYear;

    if (year) {
      const dateStart = formatDate(startDay, month, year);
      const dateEnd = formatDate(endDay, month, year);

      if (dateStart && dateEnd) {
        return {
          dateStart,
          dateEnd,
        };
      }
    }
  }

  // ---------------------------------------------------------
  // FORMAT:
  // 20 Desember 2026 - 2 Januari 2027
  // 20 Desember 2026 s.d. 2 Januari 2027
  // ---------------------------------------------------------
  const crossMonthRange = new RegExp(
    `(\\d{1,2})\\s+(${MONTH_NAMES})\\s*(20\\d{2})?\\s*(?:-|s\\.d\\.?|s/d|sd|sampai|hingga)\\s*(\\d{1,2})\\s+(${MONTH_NAMES})\\s*(20\\d{2})?`,
    "i"
  );

  const crossMonthMatch = text.match(crossMonthRange);

  if (crossMonthMatch) {
    const startDay = Number(crossMonthMatch[1]);
    const startMonth = crossMonthMatch[2];

    const startYear = crossMonthMatch[3]
      ? Number(crossMonthMatch[3])
      : defaultYear;

    const endDay = Number(crossMonthMatch[4]);
    const endMonth = crossMonthMatch[5];

    let endYear = crossMonthMatch[6]
      ? Number(crossMonthMatch[6])
      : startYear;

    // Jika bulan akhir lebih kecil daripada bulan awal
    // dan tahun akhir tidak ditulis, kemungkinan melewati tahun.
    if (
      startYear &&
      !crossMonthMatch[6] &&
      Number(MONTHS[endMonth.toLowerCase()]) <
        Number(MONTHS[startMonth.toLowerCase()])
    ) {
      endYear = startYear + 1;
    }

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
        return {
          dateStart,
          dateEnd,
        };
      }
    }
  }

  // ---------------------------------------------------------
  // FORMAT NUMERIK:
  // 14/07/2026 - 16/07/2026
  // ---------------------------------------------------------
  const numericRange = text.match(
    /(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d{2})\s*(?:-|s\.d\.?|s\/d|sd|sampai|hingga)\s*(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d{2})/i
  );

  if (numericRange) {
    const startDay = Number(numericRange[1]);
    const startMonth = Number(numericRange[2]);
    const startYear = Number(numericRange[3]);

    const endDay = Number(numericRange[4]);
    const endMonth = Number(numericRange[5]);
    const endYear = Number(numericRange[6]);

    if (
      startDay >= 1 &&
      startDay <= 31 &&
      startMonth >= 1 &&
      startMonth <= 12 &&
      endDay >= 1 &&
      endDay <= 31 &&
      endMonth >= 1 &&
      endMonth <= 12
    ) {
      return {
        dateStart: `${startYear}-${String(startMonth).padStart(
          2,
          "0"
        )}-${String(startDay).padStart(2, "0")}`,
        dateEnd: `${endYear}-${String(endMonth).padStart(
          2,
          "0"
        )}-${String(endDay).padStart(2, "0")}`,
      };
    }
  }

  return null;
}

function findDateInLine(
  line: string,
  defaultYear?: number
): { dateStart: string; dateEnd: string } | null {
  const range = parseDateRange(line, defaultYear);

  if (range) {
    return range;
  }

  const date = parseSingleDate(line, defaultYear);

  if (date) {
    return {
      dateStart: date,
      dateEnd: date,
    };
  }

  return null;
}

function removeDateFromTitle(text: string): string {
  let title = text;

  // Normalisasi dash
  title = title.replace(/[–—−]/g, "-");

  /*
   * =========================================================
   * HAPUS RENTANG TANGGAL
   * =========================================================
   *
   * Contoh:
   * 8-11 September 2025
   * 8-11 September : 2025
   * 8-11 September
   */
  title = title.replace(
    new RegExp(
      `\\d{1,2}\\s*-\\s*\\d{1,2}\\s+${MONTH_NAMES}(?:\\s*[:;,]?\\s*20\\d{2})?`,
      "gi"
    ),
    " "
  );

  /*
   * Contoh:
   * 20 Desember 2026 - 2 Januari 2027
   * 20 Desember - 2 Januari
   */
  title = title.replace(
    new RegExp(
      `\\d{1,2}\\s+${MONTH_NAMES}(?:\\s*[:;,]?\\s*20\\d{2})?\\s*` +
        `(?:-|s\\.d\\.?|s/d|sd|sampai|hingga)\\s*` +
        `\\d{1,2}\\s+${MONTH_NAMES}(?:\\s*[:;,]?\\s*20\\d{2})?`,
      "gi"
    ),
    " "
  );

  /*
   * =========================================================
   * HAPUS TANGGAL TUNGGAL
   * =========================================================
   *
   * Contoh:
   * 5 September 2025
   * 5 September : 2025
   * 5 September
   */
  title = title.replace(
    new RegExp(
      `\\d{1,2}\\s+${MONTH_NAMES}(?:\\s*[:;,]?\\s*20\\d{2})?`,
      "gi"
    ),
    " "
  );

  /*
   * =========================================================
   * HAPUS FORMAT TANGGAL NUMERIK
   * =========================================================
   *
   * Contoh:
   * 17/08/2025
   * 17-08-2025
   * 17.08.2025
   */
  title = title.replace(
    /\d{1,2}[\/.-]\d{1,2}[\/.-]20\d{2}/gi,
    " "
  );

  /*
   * =========================================================
   * HAPUS SISA TAHUN
   * =========================================================
   */
  title = title.replace(
    /20\d{2}/g,
    " "
  );

  /*
   * =========================================================
   * HAPUS SISA ANGKA SETELAH TITIK DUA
   *
   * Ini bagian penting untuk kasus:
   *
   * :11 Geladi Bersih ANBK
   * :30 Sulingjar
   * :25 Pelaksanaan ANBK
   *
   * menjadi:
   *
   * Geladi Bersih ANBK
   * Sulingjar
   * Pelaksanaan ANBK
   * =========================================================
   */
  title = title.replace(
    /^\s*[:;,]\s*\d{1,2}\s*/,
    " "
  );

  /*
   * Jika ada angka sisa setelah tanggal tanpa titik dua,
   * misalnya:
   *
   * 8-11 September 11 Geladi Bersih
   *
   * hapus angka tersebut.
   */
  title = title.replace(
  /^\s*[-:;,]?\s*\d{1,2}\s*[:;,]?\s*/,
  ""
);
/*
 * =========================================================
 * HAPUS SISA NOMOR TANGGAL SETELAH PEMISAH
 *
 * Contoh:
 * -17 : Kegiatan MPLS
 * —17 : Kegiatan MPLS
 * -4 : Sumatif Akhir Semester
 * -11 : Hari Raya Idul Fitri
 *
 * menjadi:
 * Kegiatan MPLS
 * Sumatif Akhir Semester
 * Hari Raya Idul Fitri
 * =========================================================
 */
title = title.replace(
  /^\s*[-]\s*\d{1,2}\s*[:;,]\s*/,
  " "
);
  /*
   * Hapus kata penghubung tanggal yang tersisa.
   */
  title = title.replace(
    /\b(s\.d\.?|s\/d|sd|sampai|hingga)\b/gi,
    " "
  );

  /*
   * Hapus karakter pemisah yang tertinggal.
   */
  // Bersihkan sisa pemisah tanggal dan angka yang tertinggal.
// Contoh:
// ":11 Geladi Bersih ANBK"
// ":30 Sulingjar"
// ":25 Pelaksanaan ANBK"
title = title.replace(
  /^\s*[:;,]?\s*\d{1,2}\s+/,
  ""
);

// Bersihkan tanda pemisah yang masih tersisa
title = title
  .replace(/^[\s:;,\-|]+/, "")
  .replace(/[\s:;,\-|]+$/, "");

/*
 * Rapikan spasi.
 */
title = title
  .replace(/\s+/g, " ")
  .trim();

return cleanTitle(title);
}

function extractTitle(line: string): string {
  const title = removeDateFromTitle(line);

  if (!title) {
    return "Kegiatan Kalender Pendidikan";
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
    /*
     * =====================================================
     * FORMAT TABEL MARKDOWN
     *
     * | 8–11 September 2025 | Geladi Bersih ANBK SD |
     * =====================================================
     */
    if (line.startsWith("|") && line.endsWith("|")) {
      const columns = line
        .split("|")
        .map((column) => column.trim())
        .filter(Boolean);

      // Abaikan baris separator:
      // | ---------------- | ---------------- |
      if (
        columns.length >= 2 &&
        columns.every((column) => /^[-: ]+$/.test(column))
      ) {
        continue;
      }

      if (columns.length >= 2) {
        const dateColumn = columns[0];
        const titleColumn = columns[1];

        /*
         * Hilangkan bold Markdown:
         * **8–11 September 2025**
         */
        const cleanDateColumn = dateColumn
          .replace(/\*\*/g, "")
          .trim();

        const cleanTitleColumn = titleColumn
          .replace(/\*\*/g, "")
          .trim();

        /*
         * Simpan tahun terakhir yang ditemukan.
         */
        const detectedYear = extractYear(cleanDateColumn);

        if (detectedYear) {
          currentYear = detectedYear;
        }

        /*
         * Parsing tanggal HANYA dari kolom tanggal.
         */
        const dateInfo = parseDateRange(
          cleanDateColumn,
          currentYear
        );

        const singleDate = dateInfo
          ? null
          : parseSingleDate(
              cleanDateColumn,
              currentYear
            );

        let finalDateStart = "";
        let finalDateEnd = "";

        if (dateInfo) {
          finalDateStart = dateInfo.dateStart;
          finalDateEnd = dateInfo.dateEnd;
        } else if (singleDate) {
          finalDateStart = singleDate;
          finalDateEnd = singleDate;
        }

        /*
         * Jika tanggal valid dan keterangan tidak kosong,
         * langsung gunakan kolom kedua sebagai judul.
         */
        if (finalDateStart && finalDateEnd && cleanTitleColumn) {
          events.push({
            title: cleanTitleColumn,
            dateStart: finalDateStart,
            dateEnd: finalDateEnd,
            category: detectCategory(cleanTitleColumn),
          });

          continue;
        }
      }
    }

    /*
     * =====================================================
     * FORMAT TEKS BIASA
     *
     * Tetap dipertahankan sebagai fallback.
     * =====================================================
     */

    const detectedYear = extractYear(line);

    if (detectedYear) {
      currentYear = detectedYear;
    }

    const dateInfo = findDateInLine(line, currentYear);

    if (!dateInfo) {
      continue;
    }

    const title = extractTitle(line);

    if (!title) {
      continue;
    }

    events.push({
      title,
      dateStart: dateInfo.dateStart,
      dateEnd: dateInfo.dateEnd,
      category: detectCategory(title),
    });
  }

  /*
   * =====================================================
   * HILANGKAN DUPLIKASI
   * =====================================================
   */
  const uniqueEvents = events.filter(
    (event, index, array) => {
      return (
        array.findIndex(
          (item) =>
            item.title.toLowerCase() ===
              event.title.toLowerCase() &&
            item.dateStart === event.dateStart &&
            item.dateEnd === event.dateEnd
        ) === index
      );
    }
  );

  return uniqueEvents;
}