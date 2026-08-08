import React, { useState } from "react";
import {
  AcademicYearConfig,
  KaldikEvent,
  SchoolIdentity,
} from "../types";

import { CATEGORIES } from "../data/categories";
import {
  School,
  Calendar,
  Plus,
  Sparkles,
  Printer,
  Download,
  Upload,
  Search,
  Trash2,
  Edit2,
  List,
  Sliders,
} from "lucide-react";

interface SidebarEditorProps {
  identity: SchoolIdentity;
  onIdentityChange: (updated: SchoolIdentity) => void;
  config: AcademicYearConfig;
  onConfigChange: (updated: AcademicYearConfig) => void;
  events: KaldikEvent[];
  onAddEventClick: () => void;
  onEditEventClick: (evt: KaldikEvent) => void;
  onDeleteEvent: (id: string) => void;
  onLoadPreset: (presetEvents: KaldikEvent[]) => void;
  onOpenAIModal: () => void;
  onPrintClick: () => void;
}

export const SidebarEditor: React.FC<SidebarEditorProps> = ({
  identity,
  onIdentityChange,
  config,
  onConfigChange,
  events,
  onAddEventClick,
  onEditEventClick,
  onDeleteEvent,
  onLoadPreset,
  onOpenAIModal,
  onPrintClick,
}) => {
  const [activeTab, setActiveTab] = useState<"school" | "config" | "events" | "export">("events");
  const [searchTerm, setSearchTerm] = useState("");

  const handleIdentityInput = (key: keyof SchoolIdentity, value: string) => {
    onIdentityChange({
      ...identity,
      [key]: value,
    });
  };

  const handleYearChange = (startYear: number) => {
  onConfigChange({
    ...config,
    yearStart: startYear,
    yearEnd: startYear + 1,
  });

  // Setiap tahun ajaran dimulai dengan kalender kosong.
  // Kegiatan/libur akan dimasukkan melalui AI Parser atau manual.
  onLoadPreset([]);
};

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ identity, config, events }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Kalender_Pendidikan_SD_${config.yearStart}_${config.yearEnd}.json`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.identity) onIdentityChange(parsed.identity);
        if (parsed.config) onConfigChange(parsed.config);
        if (Array.isArray(parsed.events)) onLoadPreset(parsed.events);
        alert("Berhasil mengimpor data kalender!");
      } catch {
        alert("Format file JSON tidak valid.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full bg-slate-900 text-slate-100 flex flex-col h-full print:hidden border-r border-slate-800">
      {/* Top Banner Actions */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold uppercase text-white tracking-wider">
              Generator Kaldik SD
            </h2>
            <p className="text-[11px] text-slate-400">
              Tahun Ajaran {config.yearStart}/{config.yearEnd}
            </p>
          </div>

          <button
            onClick={onPrintClick}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak (A4)
          </button>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={onAddEventClick}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white py-1.5 px-2 rounded-md border border-slate-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Tambah Event
          </button>

          <button
            onClick={onOpenAIModal}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 py-1.5 px-2 rounded-md border border-indigo-700/80 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Text Parser
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-4 bg-slate-900 border-b border-slate-800 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab("events")}
          className={`py-2.5 px-1 text-center flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === "events"
              ? "text-blue-400 border-b-2 border-blue-500 bg-slate-800/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <List className="w-4 h-4" />
          Kegiatan
        </button>

        <button
          onClick={() => setActiveTab("school")}
          className={`py-2.5 px-1 text-center flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === "school"
              ? "text-blue-400 border-b-2 border-blue-500 bg-slate-800/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <School className="w-4 h-4" />
          Identitas
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`py-2.5 px-1 text-center flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === "config"
              ? "text-blue-400 border-b-2 border-blue-500 bg-slate-800/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Tahun Ajaran
        </button>

        <button
          onClick={() => setActiveTab("export")}
          className={`py-2.5 px-1 text-center flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === "export"
              ? "text-blue-400 border-b-2 border-blue-500 bg-slate-800/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Download className="w-4 h-4" />
          Ekspor
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TAB: KEGIATAN */}
        {activeTab === "events" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari kegiatan atau libur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Total: {filteredEvents.length} Kegiatan</span>
              <button
                onClick={onAddEventClick}
                className="text-blue-400 hover:underline font-semibold"
              >
                + Tambah Baru
              </button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <p className="text-slate-500 italic text-center py-6">
                  Tidak ada kegiatan ditemukan.
                </p>
              ) : (
                filteredEvents.map((evt) => {
                  const cat = CATEGORIES[evt.category] || CATEGORIES.khusus;
                  return (
                    <div
                      key={evt.id}
                      className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 flex items-start justify-between gap-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <h5 className="font-bold text-white text-xs truncate">
                            {evt.title}
                          </h5>
                        </div>

                        <p className="text-[10px] text-slate-400 font-mono">
                          {evt.dateStart === evt.dateEnd
                            ? evt.dateStart
                            : `${evt.dateStart} s.d ${evt.dateEnd}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => onEditEventClick(evt)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(evt.id)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB: IDENTITAS SEKOLAH */}
        {activeTab === "school" && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={identity.schoolName}
                onChange={(e) => handleIdentityInput("schoolName", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
<div>
  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
    Logo Sekolah
  </label>

  <div className="flex items-center gap-3">
    {identity.logo ? (
      <div className="relative">
        <img
          src={identity.logo}
          alt="Logo Sekolah"
          className="w-16 h-16 object-contain bg-white rounded-lg border border-slate-700 p-1"
        />

        <button
          type="button"
          onClick={() => handleIdentityInput("logo", "")}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-700"
          title="Hapus logo"
        >
          ×
        </button>
      </div>
    ) : (
      <div className="w-16 h-16 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-[10px] text-center">
        Belum ada logo
      </div>
    )}

    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
      <Upload className="w-4 h-4" />
      Upload Logo

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          const reader = new FileReader();

          reader.onload = () => {
            if (typeof reader.result === "string") {
              handleIdentityInput("logo", reader.result);
            }
          };

          reader.readAsDataURL(file);
          e.target.value = "";
        }}
      />
    </label>
  </div>

  <p className="text-[10px] text-slate-500 mt-1">
    PNG, JPG, atau WebP. Logo akan digunakan pada dokumen kalender.
  </p>
</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={identity.district}
                  onChange={(e) => handleIdentityInput("district", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={identity.province}
                  onChange={(e) => handleIdentityInput("province", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <hr className="border-slate-800 my-2" />

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                value={identity.principalName}
                onChange={(e) => handleIdentityInput("principalName", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={identity.principalNip}
                onChange={(e) => handleIdentityInput("principalNip", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <hr className="border-slate-800 my-2" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Kota Pembuatan
                </label>
                <input
                  type="text"
                  value={identity.city}
                  onChange={(e) => handleIdentityInput("city", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Tanggal Pembuatan
                </label>
                <input
                  type="text"
                  value={identity.documentDate}
                  onChange={(e) => handleIdentityInput("documentDate", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Guru Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: VI A"
                  value={identity.teacherClass}
                  onChange={(e) => handleIdentityInput("teacherClass", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Nama Guru
                </label>
                <input
                  type="text"
                  value={identity.teacherName}
                  onChange={(e) => handleIdentityInput("teacherName", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

           <div>
  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
    Jenis Nomor Identitas Guru
  </label>

  <select
    value={identity.teacherNipLabel}
    onChange={(e) =>
      handleIdentityInput(
        "teacherNipLabel",
        e.target.value
      )
    }
    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
  >
    <option value="NIP">NIP</option>
    <option value="NI PPPK">NI PPPK</option>
  </select>
</div>

<div>
  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
    Nomor Identitas Guru
  </label>

  <input
    type="text"
    value={identity.teacherNip}
    onChange={(e) =>
      handleIdentityInput("teacherNip", e.target.value)
    }
    placeholder={
      identity.teacherNipLabel === "NI PPPK"
        ? "Masukkan NI PPPK"
        : "Masukkan NIP"
    }
    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
  />
</div>
          </div>
        )}

        {/* TAB: TAHUN AJARAN & PRESET */}
        {activeTab === "config" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Pilih Tahun Ajaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[2025, 2026, 2027, 2028].map((startYear) => (
                  <button
                    key={startYear}
                    onClick={() => handleYearChange(startYear)}
                    className={`py-2 px-3 rounded-lg font-bold text-xs border cursor-pointer transition-all ${
                      config.yearStart === startYear
                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {startYear}/{startYear + 1}
                  </button>
                ))}
              </div>
            </div>

           

            <hr className="border-slate-800" />

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Urutan Bulan Grid Kalender
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="monthOrder"
                    checked={config.monthOrder === "academic"}
                    onChange={() => onConfigChange({ ...config, monthOrder: "academic" })}
                    className="text-blue-600 focus:ring-0"
                  />
                  <span>Tahun Ajaran (Juli {config.yearStart} – Juni {config.yearEnd})</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="monthOrder"
                    checked={config.monthOrder === "calendar"}
                    onChange={() => onConfigChange({ ...config, monthOrder: "calendar" })}
                    className="text-blue-600 focus:ring-0"
                  />
                  <span>Tahun Masehi (Januari – Desember)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EKSPOR & BACKUP */}
        {activeTab === "export" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-white text-xs uppercase mb-1">Cetak Dokumen A4</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Cetak langsung atau simpan sebagai PDF A4 Landscape 1 Halaman yang rapi.
              </p>
              <button
                onClick={onPrintClick}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak ke PDF / Printer
              </button>
            </div>

            <hr className="border-slate-800" />

            <div>
              <h4 className="font-bold text-white text-xs uppercase mb-1">Backup & Restore JSON</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Simpan atau buka file konfigurasi kalender sekolah Anda.
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 px-3 rounded-lg border border-slate-700 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Unduh Backup JSON
                </button>

                <label className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 px-3 rounded-lg border border-slate-700 cursor-pointer">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Impor File JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
