export type EventCategory = 
  | "libur_nasional"
  | "libur_semester"
  | "mpls"
  | "asesmen"
  | "rapor"
  | "kegiatan_sekolah"
  | "khusus";

export interface CategoryInfo {
  id: EventCategory;
  label: string;
  color: string; // Tailwind bg class or hex for dot/badge
  textColor: string;
  borderColor: string;
  bgLight: string;
}

export interface KaldikEvent {
  id: string;
  title: string;
  dateStart: string; // YYYY-MM-DD
  dateEnd: string;   // YYYY-MM-DD (same as dateStart if single day)
  category: EventCategory;
  notes?: string;
}

export interface SchoolIdentity {
  schoolName: string;
  district: string;      // Kabupaten / Kota
  province: string;      // Provinsi
  principalName: string; // Nama Kepala Sekolah
  principalNip: string;  // NIP Kepala Sekolah
  teacherName: string;   // Nama Guru Kelas
  teacherNip: string;    // NIP / NIPPPK Guru
  teacherClass: string;  // e.g. "I A", "IV", "VI"
  city: string;          // Kota tempat TTD
  documentDate: string;  // Tanggal pembuatan document e.g. "14 Juli 2025"
    logo?: string;
}

export interface AcademicYearConfig {
  yearStart: number; // e.g. 2025
  yearEnd: number;   // e.g. 2026
  monthOrder: "academic" | "calendar"; // academic: Juli - Juni | calendar: Januari - Desember
}

export interface MonthInfo {
  monthIndex: number; // 0-indexed (0 = Jan, 6 = Jul, 11 = Dec)
  year: number;
  monthNameIndonesian: string;
  daysCount: number;
  startDayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
}

export interface MergedEventRange {
  displayDateRange: string;
  title: string;
  category: EventCategory;
  rawEvents: KaldikEvent[];
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  checkedCount: number;
}
