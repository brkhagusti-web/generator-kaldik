import React, { useState } from "react";
import { ValidationResult } from "../types";
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

interface ValidationBannerProps {
  validation: ValidationResult;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({ validation }) => {
  const [expanded, setExpanded] = useState(false);

  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return (
      <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5 text-xs text-emerald-900 flex items-center justify-between shadow-xs print:hidden">
        <div className="flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Validasi Otomatis: Kalender Akurat & Sesuai Aturan Masehi</span>
        </div>
        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
          {validation.checkedCount} Kegiatan Terdaftar
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-2.5 text-xs border shadow-xs print:hidden transition-all ${
        hasErrors
          ? "bg-red-50 border-red-300 text-red-900"
          : "bg-amber-50 border-amber-300 text-amber-900"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          {hasErrors ? (
            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          )}
          <span>
            {hasErrors
              ? "Perhatian: Terdapat Konflik Data Kalender!"
              : "Peringatan Validasi Kalender Pendidikan"}
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] font-bold underline cursor-pointer hover:opacity-80"
        >
          {expanded ? "Sembunyikan Detail" : "Lihat Detail"}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1 text-[11px] font-medium">
          {validation.errors.map((err, i) => (
            <div key={`err-${i}`} className="text-red-700 flex items-start gap-1">
              <span className="font-bold">•</span>
              <span>{err}</span>
            </div>
          ))}
          {validation.warnings.map((warn, i) => (
            <div key={`warn-${i}`} className="text-amber-800 flex items-start gap-1">
              <span className="font-bold">•</span>
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
