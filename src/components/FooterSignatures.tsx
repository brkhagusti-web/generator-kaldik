import React from "react";
import { SchoolIdentity } from "../types";

interface FooterSignaturesProps {
  identity: SchoolIdentity;
}

export const FooterSignatures: React.FC<FooterSignaturesProps> = ({ identity }) => {
  return (
    <div className="w-full mt-2 print:mt-1 pt-1 border-t border-slate-300 grid grid-cols-2 text-center text-[9.5px] print:text-[8px] font-semibold text-slate-900 leading-tight">
      {/* Left Block: Kepala Sekolah */}
      <div className="flex flex-col items-center">
        <p>Mengetahui,</p>
        <p className="font-bold">Kepala Sekolah</p>
        {/* 4-5 lines height for physical signature space */}
        <div className="h-10 print:h-8" />
        <p className="font-extrabold underline uppercase">
          {identity.principalName || "(Nama Kepala Sekolah)"}
        </p>
        <p className="font-medium text-slate-700">
          NIP. {identity.principalNip || "...................................."}
        </p>
      </div>

      {/* Right Block: Guru Kelas */}
      <div className="flex flex-col items-center">
        <p>
          {identity.city || "Kota"}, {identity.documentDate || "...................."}
        </p>
        <p className="font-bold">
          Guru Kelas {identity.teacherClass || "........"}
        </p>
        {/* 4-5 lines height for physical signature space */}
        <div className="h-10 print:h-8" />
        <p className="font-extrabold underline uppercase">
          {identity.teacherName || "(Nama Guru)"}
        </p>
        <p className="font-medium text-slate-700">
          NIP. {identity.teacherNip || "...................................."}
        </p>
      </div>
    </div>
  );
};
