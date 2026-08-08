import React from "react";
import {
  AcademicYearConfig,
  EffectiveWeekResult,
  KaldikEvent,
  SchoolIdentity,
} from "../types";
import { calculateEffectiveWeeks } from "../utils/effectiveWeekCalculator";

interface EffectiveWeekAnalysisProps {
  identity: SchoolIdentity;
  config: AcademicYearConfig;
  events: KaldikEvent[];
  semester1Start: Date;
  semester1End: Date;
  semester2Start: Date;
  semester2End: Date;
}

const INEFFECTIVE_CATEGORIES = [
  "libur_nasional",
  "libur_semester",
  "mpls",
  "asesmen",
  "rapor",
];

const SCHOOL_DAYS = [1, 2, 3, 4, 5, 6];

interface AffectedEventInfo {
  event: KaldikEvent;
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

function isSchoolDay(date: Date): boolean {
  return SCHOOL_DAYS.includes(date.getDay());
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function cleanEventTitle(
  title: string,
  yearStart: number,
  yearEnd: number
): string {
  let cleaned = title.trim();

  // Hapus angka tanggal di awal judul.
  // Contoh: "13 Libur Semester Genap TA /"
  // menjadi "Libur Semester Genap TA /"
  cleaned = cleaned.replace(/^\d{1,2}\s+/, "");

  // Ganti "TA /" atau "TA" di akhir judul
  // dengan tahun ajaran sesuai input pengguna.
  cleaned = cleaned.replace(
    /\bTA\s*\/?\s*$/i,
    `TA ${yearStart}/${yearEnd}`
  );

  return cleaned.trim();
}

function countAffectedSchoolDays(
  event: KaldikEvent,
  semesterStart: Date,
  semesterEnd: Date
): number {
  const eventStart = parseDate(event.dateStart);
  const eventEnd = parseDate(event.dateEnd);

  const start =
    eventStart > semesterStart ? eventStart : semesterStart;

  const end =
    eventEnd < semesterEnd ? eventEnd : semesterEnd;

  if (start > end) {
    return 0;
  }

  let count = 0;
  let current = new Date(start);

  while (current <= end) {
    if (isSchoolDay(current)) {
      count++;
    }

    current = addDays(current, 1);
  }

  return count;
}

function getAffectedEvents(
  events: KaldikEvent[],
  semesterStart: Date,
  semesterEnd: Date
): AffectedEventInfo[] {
  return events
    .filter((event) =>
      INEFFECTIVE_CATEGORIES.includes(event.category)
    )
    .map((event) => ({
      event,
      affectedDays: countAffectedSchoolDays(
        event,
        semesterStart,
        semesterEnd
      ),
    }))
    .filter((item) => item.affectedDays > 0);
}

export const EffectiveWeekAnalysis: React.FC<
  EffectiveWeekAnalysisProps
> = ({
  identity,
  config,
  events,
  semester1Start,
  semester1End,
  semester2Start,
  semester2End,
}) => {
  const semester1 = calculateEffectiveWeeks(
    events,
    semester1Start,
    semester1End,
    "Semester 1"
  );

  const semester2 = calculateEffectiveWeeks(
    events,
    semester2Start,
    semester2End,
    "Semester 2"
  );

  const results: EffectiveWeekResult[] = [
    semester1,
    semester2,
  ];

  const semester1AffectedEvents = getAffectedEvents(
    events,
    semester1Start,
    semester1End
  );

  const semester2AffectedEvents = getAffectedEvents(
    events,
    semester2Start,
    semester2End
  );

  const affectedEventsBySemester = [
    {
      semester: "Semester 1",
      events: semester1AffectedEvents,
    },
    {
      semester: "Semester 2",
      events: semester2AffectedEvents,
    },
  ];

  return (
    <div className="w-full max-w-[297mm] mx-auto bg-white p-5 print:p-3 text-slate-900 font-sans print:break-after-page">
      {/* HEADER */}
      <div className="text-center mb-5">
        {identity.logo && (
          <img
            src={identity.logo}
            alt="Logo Sekolah"
            className="mx-auto h-16 print:h-12 mb-2 object-contain"
          />
        )}

        <h1 className="text-xl print:text-lg font-extrabold uppercase tracking-wide">
          ANALISIS MINGGU EFEKTIF
        </h1>

        <p className="text-sm print:text-xs font-bold uppercase mt-1">
          {identity.schoolName}
        </p>

        <p className="text-xs print:text-[10px] mt-0.5">
          Tahun Ajaran {config.yearStart}/{config.yearEnd}
        </p>
      </div>

      {/* A. REKAPITULASI */}
      <div className="mb-5">
        <h2 className="text-sm print:text-xs font-extrabold uppercase border-b border-slate-400 pb-1 mb-2">
          A. Rekapitulasi Minggu Efektif
        </h2>

        <table className="w-full border-collapse text-xs print:text-[10px]">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 px-2 py-1.5 text-left">
                Semester
              </th>

              <th className="border border-slate-400 px-2 py-1.5 text-center">
                Minggu Kalender
              </th>

              <th className="border border-slate-400 px-2 py-1.5 text-center">
                Minggu Tidak Efektif
              </th>

              <th className="border border-slate-400 px-2 py-1.5 text-center">
                Minggu Efektif
              </th>
            </tr>
          </thead>

          <tbody>
            {results.map((result) => (
              <tr key={result.semester}>
                <td className="border border-slate-400 px-2 py-1.5 font-bold">
                  {result.semester}
                </td>

                <td className="border border-slate-400 px-2 py-1.5 text-center">
                  {result.calendarWeeks}
                </td>

                <td className="border border-slate-400 px-2 py-1.5 text-center">
                  {result.ineffectiveWeeks}
                </td>

                <td className="border border-slate-400 px-2 py-1.5 text-center font-extrabold">
                  {result.effectiveWeeks}
                </td>
              </tr>
            ))}

            <tr className="bg-slate-100 font-extrabold">
              <td className="border border-slate-400 px-2 py-1.5">
                Total 1 Tahun
              </td>

              <td className="border border-slate-400 px-2 py-1.5 text-center">
                {results.reduce(
                  (total, result) =>
                    total + result.calendarWeeks,
                  0
                )}
              </td>

              <td className="border border-slate-400 px-2 py-1.5 text-center">
                {results.reduce(
                  (total, result) =>
                    total + result.ineffectiveWeeks,
                  0
                )}
              </td>

              <td className="border border-slate-400 px-2 py-1.5 text-center">
                {results.reduce(
                  (total, result) =>
                    total + result.effectiveWeeks,
                  0
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* B. RINCIAN MINGGU TIDAK EFEKTIF */}
      <div>
        <h2 className="text-sm print:text-xs font-extrabold uppercase border-b border-slate-400 pb-1 mb-2">
          B. Rincian Minggu Tidak Efektif
        </h2>

        {results.map((result) => (
          <div key={result.semester} className="mb-4">
            <h3 className="text-xs print:text-[10px] font-bold mb-1">
              {result.semester}
            </h3>

            {result.ineffectiveDetails.length === 0 ? (
              <p className="text-xs print:text-[10px] text-slate-500 italic">
                Tidak terdapat minggu tidak efektif.
              </p>
            ) : (
              <table className="w-full border-collapse text-xs print:text-[9px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-2 py-1 text-center w-[10%]">
                      Minggu
                    </th>

                    <th className="border border-slate-300 px-2 py-1 text-left w-[25%]">
                      Rentang Tanggal
                    </th>

                    <th className="border border-slate-300 px-2 py-1 text-center w-[12%]">
                      Hari Terganggu
                    </th>

                    <th className="border border-slate-300 px-2 py-1 text-left">
                      Kegiatan
                    </th>

                    <th className="border border-slate-300 px-2 py-1 text-center w-[16%]">
                      Kategori
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {result.ineffectiveDetails.map(
                    (detail, index) => (
                      <tr
                        key={`${result.semester}-${index}`}
                      >
                        <td className="border border-slate-300 px-2 py-1 text-center">
                          {detail.week}
                        </td>

                        <td className="border border-slate-300 px-2 py-1">
                          {detail.dateRange}
                        </td>

                        <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                          {detail.affectedDays} hari
                        </td>

                        <td className="border border-slate-300 px-2 py-1">
  {cleanEventTitle(
    detail.title,
    config.yearStart,
    config.yearEnd
  )}
</td>

                        <td className="border border-slate-300 px-2 py-1 text-center capitalize">
                          {detail.category.replaceAll(
                            "_",
                            " "
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>

      {/* C. RINCIAN HARI / KEGIATAN TERGANGGU */}
      <div className="mt-5">
        <h2 className="text-sm print:text-xs font-extrabold uppercase border-b border-slate-400 pb-1 mb-2">
          C. Rincian Hari dan Kegiatan Terganggu
        </h2>

        <p className="text-[10px] print:text-[8px] mb-2 text-slate-600">
          Daftar berikut memuat seluruh kegiatan yang mengganggu
          hari sekolah. Kegiatan 1–2 hari tetap dicatat sebagai
          hari terganggu, tetapi tidak mengurangi jumlah minggu
          efektif.
        </p>

        {affectedEventsBySemester.map((semesterData) => (
          <div
            key={semesterData.semester}
            className="mb-4"
          >
            <h3 className="text-xs print:text-[10px] font-bold mb-1">
              {semesterData.semester}
            </h3>

            <table className="w-full border-collapse text-xs print:text-[9px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 px-2 py-1 text-center w-[10%]">
                    No.
                  </th>

                  <th className="border border-slate-300 px-2 py-1 text-left w-[25%]">
                    Tanggal
                  </th>

                  <th className="border border-slate-300 px-2 py-1 text-left">
                    Kegiatan
                  </th>

                  <th className="border border-slate-300 px-2 py-1 text-center w-[18%]">
                    Kategori
                  </th>

                  <th className="border border-slate-300 px-2 py-1 text-center w-[15%]">
                    Hari Terganggu
                  </th>
                </tr>
              </thead>

              <tbody>
                {semesterData.events.map(
                  (item, index) => (
                    <tr
                      key={`${semesterData.semester}-${item.event.id}`}
                    >
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {index + 1}
                      </td>

                      <td className="border border-slate-300 px-2 py-1">
                        {formatDate(
                          parseDate(item.event.dateStart)
                        )}
                        {item.event.dateEnd !==
                          item.event.dateStart && (
                          <>
                            {" – "}
                            {formatDate(
                              parseDate(item.event.dateEnd)
                            )}
                          </>
                        )}
                      </td>

                      <td className="border border-slate-300 px-2 py-1">
  {cleanEventTitle(
    item.event.title,
    config.yearStart,
    config.yearEnd
  )}
</td>

                      <td className="border border-slate-300 px-2 py-1 text-center capitalize">
                        {item.event.category.replaceAll(
                          "_",
                          " "
                        )}
                      </td>

                      <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                        {item.affectedDays} hari
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* D. KETENTUAN PERHITUNGAN */}
      <div className="mt-4 border border-slate-300 p-3 print:p-2 text-[10px] print:text-[8px]">
        <p className="font-bold mb-1">
          D. Ketentuan Perhitungan:
        </p>

        <ul className="list-disc ml-4 space-y-0.5">
          <li>
            Hari sekolah yang digunakan dalam perhitungan
            adalah Senin sampai Sabtu.
          </li>

          <li>
            Kategori yang diperhitungkan sebagai gangguan
            adalah libur nasional, libur semester, MPLS,
            asesmen, dan rapor.
          </li>

          <li>
            Gangguan 1–2 hari dalam satu minggu tetap
            dihitung sebagai minggu efektif.
          </li>

          <li>
            Gangguan 3 hari atau lebih dalam satu minggu
            dihitung sebagai minggu tidak efektif.
          </li>

          <li>
            Tanggal yang sama tidak dihitung dua kali dalam
            menentukan jumlah hari terganggu pada suatu
            minggu.
          </li>

          <li>
            Minggu efektif = Minggu kalender − Minggu tidak
            efektif.
          </li>
        </ul>
      </div>

      {/* TANDA TANGAN */}
      <div className="mt-8 print:mt-5 flex justify-end">
        <div className="text-center w-[220px] text-xs print:text-[10px]">
          <p>
            {identity.city}, {identity.documentDate}
          </p>

          <p className="font-bold">Kepala Sekolah</p>

          <div className="h-16 print:h-12" />

          <p className="font-bold underline">
            {identity.principalName}
          </p>

          <p>NIP. {identity.principalNip}</p>
        </div>
      </div>
    </div>
  );
};
