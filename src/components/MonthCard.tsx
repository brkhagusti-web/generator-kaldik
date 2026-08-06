import React from "react";
import {
  KaldikEvent,
  MonthInfo,
} from "../types";
import {
  INDONESIAN_DAY_SHORT,
  formatDateStr,
  getEventsForDate,
  groupAndMergeEventsForMonth,
} from "../utils/calendarUtils";
import { CATEGORIES } from "../data/categories";

interface MonthCardProps {
  monthInfo: MonthInfo;
  events: KaldikEvent[];
  onDateClick?: (dateStr: string) => void;
}

export const MonthCard: React.FC<MonthCardProps> = ({
  monthInfo,
  events,
  onDateClick,
}) => {
  const { year, monthIndex, monthNameIndonesian, daysCount, startDayOfWeek } = monthInfo;

  // Generate grid matrix for 6 rows x 7 days
  const gridCells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    gridCells.push(null);
  }
  for (let day = 1; day <= daysCount; day++) {
    gridCells.push(day);
  }
  // Fill remaining cells up to multiple of 7 (at least 35 or 42)
  while (gridCells.length < 35) {
    gridCells.push(null);
  }

  // Get merged keterangan list for this month
  const keteranganList = groupAndMergeEventsForMonth(events, year, monthIndex);

  // Dynamic font sizing based on keterangan count
  const eventCount = keteranganList.length;
  let textScaleClass = "text-[8.5px] leading-tight print:text-[7.5px]";
  if (eventCount >= 5) {
    textScaleClass = "text-[7.5px] leading-[1.1] print:text-[6.5px]";
  } else if (eventCount >= 7) {
    textScaleClass = "text-[6.5px] leading-[1.05] print:text-[5.5px]";
  }

  return (
    <div className="flex flex-col border border-slate-900 bg-white rounded-none shadow-none h-full overflow-hidden print:border-slate-800">
      {/* Month Header */}
      <div className="bg-slate-900 text-white text-center py-1 px-1 border-b border-slate-900 print:bg-slate-900 print:text-white print:py-0.5">
        <h4 className="text-xs print:text-[10px] font-extrabold tracking-wider uppercase">
          {monthNameIndonesian} {year}
        </h4>
      </div>

      {/* Calendar Grid Table */}
      <div className="p-1 print:p-0.5 border-b border-slate-300">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 text-center font-bold text-[9px] print:text-[8px] pb-0.5 border-b border-slate-200">
          {INDONESIAN_DAY_SHORT.map((dayName, idx) => {
            const isSunday = idx === 6;
            const isSaturday = idx === 5;
            return (
              <div
                key={dayName}
                className={`uppercase tracking-tighter ${
                  isSunday
                    ? "text-red-600 font-extrabold"
                    : isSaturday
                    ? "text-blue-600 font-extrabold"
                    : "text-slate-800"
                }`}
              >
                {dayName}
              </div>
            );
          })}
        </div>

        {/* Date Matrix */}
        <div className="grid grid-cols-7 text-center">
          {gridCells.map((dayNum, cellIdx) => {
            if (dayNum === null) {
              return (
                <div
                  key={`empty-${cellIdx}`}
                  className="h-[18px] print:h-[15px] border-r border-b border-slate-100 last:border-r-0"
                />
              );
            }

            const colIdx = cellIdx % 7;
            const isSunday = colIdx === 6;
            const isSaturday = colIdx === 5;
            const dateStr = formatDateStr(year, monthIndex, dayNum);
            const dateEvents = getEventsForDate(events, dateStr);
            const hasEvents = dateEvents.length > 0;

            // Highlight date background if holiday/event exists
            let dayBgClass = "";
            let dayTextClass = isSunday
              ? "text-red-600 font-bold"
              : isSaturday
              ? "text-blue-600 font-bold"
              : "text-slate-800";

            if (hasEvents) {
              const primaryCategory = dateEvents[0].category;
              if (primaryCategory === "libur_nasional") {
                dayBgClass = "bg-red-100 print:bg-red-100";
                dayTextClass = "text-red-700 font-extrabold";
              } else if (primaryCategory === "libur_semester") {
                dayBgClass = "bg-orange-100 print:bg-orange-100";
                dayTextClass = "text-orange-800 font-bold";
              } else if (primaryCategory === "mpls") {
                dayBgClass = "bg-emerald-100 print:bg-emerald-100";
                dayTextClass = "text-emerald-800 font-bold";
              } else if (primaryCategory === "asesmen") {
                dayBgClass = "bg-purple-100 print:bg-purple-100";
                dayTextClass = "text-purple-800 font-bold";
              } else if (primaryCategory === "rapor") {
                dayBgClass = "bg-blue-100 print:bg-blue-100";
                dayTextClass = "text-blue-800 font-bold";
              } else {
                dayBgClass = "bg-slate-100 print:bg-slate-100";
              }
            }

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => onDateClick?.(dateStr)}
                className={`h-[18px] print:h-[15px] relative flex flex-col items-center justify-center border-r border-b border-slate-100 last:border-r-0 hover:bg-slate-200 transition-colors ${dayBgClass}`}
                title={
                  hasEvents
                    ? `${dayNum} ${monthNameIndonesian}: ${dateEvents
                        .map((e) => e.title)
                        .join(", ")}`
                    : `${dayNum} ${monthNameIndonesian} ${year}`
                }
              >
                <span className={`text-[9px] print:text-[8px] leading-none ${dayTextClass}`}>
                  {dayNum}
                </span>

                {/* Event Category Indicator Dots */}
                {hasEvents && (
                  <div className="absolute bottom-[1px] flex gap-[1px] items-center justify-center max-w-full overflow-hidden">
                    {dateEvents.slice(0, 2).map((evt, idx) => {
                      const cat = CATEGORIES[evt.category] || CATEGORIES.khusus;
                      return (
                        <span
                          key={idx}
                          className="w-[3px] h-[3px] print:w-[2.5px] print:h-[2.5px] rounded-full inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                      );
                    })}
                    {dateEvents.length > 2 && (
                      <span className="text-[6px] print:text-[5px] font-extrabold text-slate-700 leading-none">
                        +{dateEvents.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keterangan Box */}
      <div className="flex-1 p-1 print:p-0.5 bg-slate-50 flex flex-col justify-start min-h-[58px] print:min-h-[52px]">
        <div className="font-extrabold text-[8px] print:text-[7px] text-slate-900 border-b border-slate-200 pb-[1px] mb-[2px] uppercase tracking-wider">
          Keterangan:
        </div>

        {keteranganList.length === 0 ? (
          <p className="text-[8px] print:text-[7px] text-slate-500 italic py-0.5">
            Tidak terdapat kegiatan khusus.
          </p>
        ) : (
          <ul className={`space-y-[2px] print:space-y-[1px] ${textScaleClass}`}>
            {keteranganList.map((item, idx) => {
              const cat = CATEGORIES[item.category] || CATEGORIES.khusus;
              return (
                <li key={idx} className="flex items-start gap-1 text-slate-800">
                  <span
                    className="w-1.5 h-1.5 print:w-1 print:h-1 rounded-full mt-[2px] flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    {item.displayDateRange} :
                  </span>
                  <span className="text-slate-800 font-medium break-words">
                    {item.title}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
