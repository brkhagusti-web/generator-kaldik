import React from "react";
import { AcademicYearConfig, KaldikEvent, SchoolIdentity } from "../types";
import { getAcademicYearMonths } from "../utils/calendarUtils";
import { HeaderSection } from "./HeaderSection";
import { MonthCard } from "./MonthCard";
import { LegendSection } from "./LegendSection";
import { FooterSignatures } from "./FooterSignatures";

interface PrintDocumentProps {
  identity: SchoolIdentity;
  config: AcademicYearConfig;
  events: KaldikEvent[];
  onDateClick?: (dateStr: string) => void;
}

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

  return (
    <div
      id="kaldik-print-area"
      className="w-full max-w-[297mm] mx-auto bg-white p-3 print:p-0 text-slate-900 font-sans shadow-lg print:shadow-none print:w-full print:max-w-none flex flex-col justify-between"
      style={{
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <HeaderSection
        identity={identity}
        yearStart={config.yearStart}
        yearEnd={config.yearEnd}
      />

      {/* 4x3 Month Grid */}
      <div className="grid grid-cols-4 gap-2 print:gap-1.5 flex-1 my-1">
        {months.map((mInfo) => (
          <MonthCard
            key={`${mInfo.year}-${mInfo.monthIndex}`}
            monthInfo={mInfo}
            events={events}
            onDateClick={onDateClick}
          />
        ))}
      </div>

      {/* Legenda Categories */}
      <LegendSection events={events} />

      {/* Footer Signature Blocks */}
      <FooterSignatures identity={identity} />
    </div>
  );
};
