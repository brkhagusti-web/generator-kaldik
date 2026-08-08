import React from "react";
import {
  AcademicYearConfig,
  KaldikEvent,
  SchoolIdentity,
} from "../types";
import { getAcademicYearMonths } from "../utils/calendarUtils";
import { HeaderSection } from "./HeaderSection";
import { MonthCard } from "./MonthCard";
import { LegendSection } from "./LegendSection";
import { FooterSignatures } from "./FooterSignatures";
import { EffectiveWeekAnalysis } from "./EffectiveWeekAnalysis";

interface PrintDocumentProps {
  identity: SchoolIdentity;
  config: AcademicYearConfig;
  events: KaldikEvent[];
  onDateClick?: (dateStr: string) => void;
}

const addDays = (dateString: string, days: number): Date => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date;
};

const findEvent = (
  events: KaldikEvent[],
  keyword: string
): KaldikEvent | undefined => {
  return events.find((event) =>
    event.title.toLowerCase().includes(keyword.toLowerCase())
  );
};

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  identity,
  config,
  events,
  onDateClick,
}) => {
  const months = getAcademicYearMonths(
    config.yearStart,
    config.yearEnd,
    config.monthOrder
  );

  const semester1StartEvent = findEvent(
    events,
    "Hari Pertama Masuk Sekolah Semester 1"
  );

  const semester1HolidayEvent = findEvent(
    events,
    "Libur Semester 1"
  );

  const semester2StartEvent = findEvent(
    events,
    "Hari Pertama Masuk Sekolah Semester 2"
  );

  const semester2HolidayEvent = findEvent(
    events,
    "Libur Akhir Tahun Ajaran"
  );

  const semester1Start = semester1StartEvent
    ? new Date(`${semester1StartEvent.dateStart}T00:00:00`)
    : new Date(config.yearStart, 6, 1);

  const semester1End = semester1HolidayEvent
    ? addDays(semester1HolidayEvent.dateStart, -1)
    : new Date(config.yearStart, 11, 31);

  const semester2Start = semester2StartEvent
    ? new Date(`${semester2StartEvent.dateStart}T00:00:00`)
    : new Date(config.yearEnd, 0, 1);

  const semester2End = semester2HolidayEvent
    ? addDays(semester2HolidayEvent.dateStart, -1)
    : new Date(config.yearEnd, 5, 30);

  return (
    <>
      {/* =========================
          HALAMAN 1 — KALENDER
          ========================= */}
      <div
        id="kaldik-print-area"
        className="w-full max-w-[297mm] mx-auto bg-white p-3 print:p-0 text-slate-900 font-sans shadow-lg print:shadow-none print:w-full print:max-w-none flex flex-col justify-between print:break-after-page"
        style={{
          boxSizing: "border-box",
        }}
      >
        <HeaderSection
          identity={identity}
          yearStart={config.yearStart}
          yearEnd={config.yearEnd}
        />

        <div className="grid grid-cols-4 gap-2 print:gap-1 my-1">
          {months.map((mInfo) => (
            <MonthCard
              key={`${mInfo.year}-${mInfo.monthIndex}`}
              monthInfo={mInfo}
              events={events}
              onDateClick={onDateClick}
            />
          ))}
        </div>

        <LegendSection events={events} />

        <FooterSignatures identity={identity} />
      </div>

      {/* =========================
          HALAMAN 2 — ANALISIS MINGGU EFEKTIF
          ========================= */}
      <EffectiveWeekAnalysis
        identity={identity}
        config={config}
        events={events}
        semester1Start={semester1Start}
        semester1End={semester1End}
        semester2Start={semester2Start}
        semester2End={semester2End}
      />
    </>
  );
};
