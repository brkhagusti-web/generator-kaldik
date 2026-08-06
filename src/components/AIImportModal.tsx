import React, { useState } from "react";
import { KaldikEvent } from "../types";
import { Sparkles, X, Loader2, FileText, CheckCircle2 } from "lucide-react";

interface AIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportEvents: (newEvents: KaldikEvent[]) => void;
  yearStart: number;
  yearEnd: number;
}

export const AIImportModal: React.FC<AIImportModalProps> = ({
  isOpen,
  onClose,
  onImportEvents,
  yearStart,
  yearEnd,
}) => {
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!rawText.trim()) {
      setErrorMessage("Silakan tempelkan teks kalender terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessCount(null);

    try {
      const res = await fetch("/api/ai/parse-kaldik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, yearStart, yearEnd }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses teks dengan AI.");
      }

      if (Array.isArray(data.events) && data.events.length > 0) {
        const formattedEvents: KaldikEvent[] = data.events.map((evt: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          title: evt.title || "Kegiatan Tanpa Judul",
          dateStart: evt.dateStart,
          dateEnd: evt.dateEnd || evt.dateStart,
          category: evt.category || "kegiatan_sekolah",
        }));

        onImportEvents(formattedEvents);
        setSuccessCount(formattedEvents.length);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage("Tidak ada kegiatan yang berhasil diekstrak dari teks ini. Pastikan teks berisi tanggal dan nama kegiatan.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="font-bold text-base">Ekstrak Kalender dengan AI</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Tempelkan teks dokumen resmi Kalender Pendidikan Dinas Pendidikan (contoh: daftar hari libur, jadwal ujian, MPLS, dll). AI akan membaca tanggal dan kegiatan secara otomatis untuk Tahun Ajaran <strong>{yearStart}/{yearEnd}</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Teks Dokumen Resmi Kalender Pendidikan
            </label>
            <textarea
              rows={7}
              placeholder={`Contoh teks dokumen:\n14-16 Juli 2025 : Masa Pengenalan Lingkungan Sekolah\n17 Agustus 2025 : HUT Kemerdekaan RI\n22-26 September 2025 : Sumatif Tengah Semester 1\n1-5 Desember 2025 : Sumatif Akhir Semester 1\n19 Desember 2025 : Pembagian Rapor Semester 1...`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {errorMessage}
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Berhasil mengekstrak {successCount} kegiatan ke dalam kalender!
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Batal
            </button>

            <button
              onClick={handleParse}
              disabled={loading || !rawText.trim()}
              className="flex items-center gap-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 px-4 py-2.5 rounded-lg shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses dengan AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Ekstrak & Tambah Kegiatan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
