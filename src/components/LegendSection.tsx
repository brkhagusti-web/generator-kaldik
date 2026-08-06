import React from "react";
import { EventCategory, KaldikEvent } from "../types";
import { CATEGORIES } from "../data/categories";

interface LegendSectionProps {
  events: KaldikEvent[];
}

export const LegendSection: React.FC<LegendSectionProps> = ({ events }) => {
  // Collect categories present in current events list
  const activeCategoryKeys = new Set<EventCategory>(events.map((e) => e.category));

  // Fallback if no events yet: show default main categories
  const categoriesToDisplay =
    activeCategoryKeys.size > 0
      ? Array.from(activeCategoryKeys).map((key) => CATEGORIES[key]).filter(Boolean)
      : Object.values(CATEGORIES);

  return (
    <div className="w-full my-1.5 print:my-1 pt-1 border-t border-slate-300">
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="font-extrabold text-[9px] print:text-[8px] uppercase tracking-wider text-slate-900">
          Legenda Kategori:
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8.5px] print:text-[7.5px] text-slate-800 font-medium">
        {categoriesToDisplay.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 print:w-2 print:h-2 rounded-sm border border-slate-400 inline-block flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span>{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
