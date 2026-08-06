import React, { useState, useEffect } from "react";
import { EventCategory, KaldikEvent } from "../types";
import { CATEGORIES } from "../data/categories";
import { X, Calendar, Save, Trash2 } from "lucide-react";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evt: KaldikEvent) => void;
  onDelete?: (id: string) => void;
  initialEvent?: Partial<KaldikEvent> | null;
  defaultDate?: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  defaultDate,
}) => {
  const [title, setTitle] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [category, setCategory] = useState<EventCategory>("kegiatan_sekolah");

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || "");
      setDateStart(initialEvent.dateStart || defaultDate || "");
      setDateEnd(initialEvent.dateEnd || initialEvent.dateStart || defaultDate || "");
      setCategory(initialEvent.category || "kegiatan_sekolah");
    } else {
      setTitle("");
      const d = defaultDate || new Date().toISOString().split("T")[0];
      setDateStart(d);
      setDateEnd(d);
      setCategory("kegiatan_sekolah");
    }
  }, [initialEvent, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStart) return;

    onSave({
      id: initialEvent?.id || `evt-${Date.now()}`,
      title: title.trim(),
      dateStart,
      dateEnd: dateEnd || dateStart,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">
              {initialEvent?.id ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Kegiatan / Libur
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Masa Pengenalan Lingkungan Sekolah (MPLS)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                required
                value={dateStart}
                onChange={(e) => {
                  setDateStart(e.target.value);
                  if (!dateEnd || e.target.value > dateEnd) {
                    setDateEnd(e.target.value);
                  }
                }}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                required
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Kategori Kegiatan
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {Object.values(CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            {initialEvent?.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Hapus kegiatan ini?")) {
                    onDelete(initialEvent.id!);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg shadow-sm"
              >
                <Save className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
