import React from "react";
import { SchoolIdentity } from "../types";

interface HeaderSectionProps {
  identity: SchoolIdentity;
  yearStart: number;
  yearEnd: number;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  identity,
  yearStart,
  yearEnd,
}) => {
  return (
    <div className="w-full text-center border-b-2 border-slate-900 pb-2 mb-2 print:pb-1 print:mb-1 print:border-slate-800">
      {identity.logo && (
  <div className="flex justify-center mb-1">
    <img
      src={identity.logo}
      alt="Logo Sekolah"
      className="w-14 h-14 print:w-10 print:h-10 object-contain"
    />
  </div>
)}
      <h1 className="text-xl print:text-base font-extrabold tracking-wide uppercase text-slate-900 leading-tight">
        KALENDER PENDIDIKAN
      </h1>
      <h2 className="text-lg print:text-sm font-bold uppercase text-slate-800 leading-tight">
        SEKOLAH DASAR
      </h2>
      <h3 className="text-md print:text-xs font-bold uppercase text-blue-900 print:text-slate-900 tracking-wider">
        TAHUN AJARAN {yearStart}/{yearEnd}
      </h3>
      <div className="mt-1 text-xs print:text-[10px] font-semibold text-slate-700 flex items-center justify-center gap-2 flex-wrap">
        <span className="uppercase font-bold text-slate-900">
          {identity.schoolName || "SD NEGERI UTAMA"}
        </span>
        <span>•</span>
        <span>{identity.district || "KABUPATEN / KOTA"}</span>
        <span>•</span>
        <span>{identity.province || "PROVINSI"}</span>
      </div>
    </div>
  );
};
