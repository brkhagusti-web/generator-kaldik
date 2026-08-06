import { CategoryInfo, EventCategory } from "../types";

export const CATEGORIES: Record<EventCategory, CategoryInfo> = {
  libur_nasional: {
    id: "libur_nasional",
    label: "Libur Nasional / Keagamaan",
    color: "#dc2626", // Red
    textColor: "text-red-700",
    borderColor: "border-red-300",
    bgLight: "bg-red-50",
  },
  libur_semester: {
    id: "libur_semester",
    label: "Libur Semester",
    color: "#ea580c", // Orange
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    bgLight: "bg-orange-50",
  },
  mpls: {
    id: "mpls",
    label: "Hari Pertama Masuk / MPLS",
    color: "#16a34a", // Green
    textColor: "text-green-700",
    borderColor: "border-green-300",
    bgLight: "bg-green-50",
  },
  asesmen: {
    id: "asesmen",
    label: "Asesmen / STS / SAS / ANBK",
    color: "#9333ea", // Purple
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    bgLight: "bg-purple-50",
  },
  rapor: {
    id: "rapor",
    label: "Pembagian Rapor",
    color: "#2563eb", // Blue
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    bgLight: "bg-blue-50",
  },
  kegiatan_sekolah: {
    id: "kegiatan_sekolah",
    label: "Kegiatan Sekolah / Khusus",
    color: "#0d9488", // Teal
    textColor: "text-teal-700",
    borderColor: "border-teal-300",
    bgLight: "bg-teal-50",
  },
  khusus: {
    id: "khusus",
    label: "Kegiatan Cadangan / Lainnya",
    color: "#4f46e5", // Indigo
    textColor: "text-indigo-700",
    borderColor: "border-indigo-300",
    bgLight: "bg-indigo-50",
  },
};
