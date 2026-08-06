import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// API route for AI Educational Calendar Text Parsing
app.post("/api/ai/parse-kaldik", async (req, res) => {
  try {
    const { rawText, yearStart, yearEnd } = req.body;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "Teks kalender tidak boleh kosong." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY belum dikonfigurasi di lingkungan server.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Kamu adalah sistem parser kalender pendidikan sekolah dasar (SD) Indonesia.
Tugasmu adalah mengekstrak daftar kegiatan/hari libur dari teks berikut ke dalam format JSON yang valid.

Tahun Ajaran: ${yearStart || 2025}/${yearEnd || 2026}
Teks Sumber:
"""
${rawText}
"""

Instruksi Penting:
1. Kembalikan HANYA array JSON berformat object dengan struktur:
[
  {
    "title": "Nama kegiatan atau libur (singkat dan tepat)",
    "dateStart": "YYYY-MM-DD",
    "dateEnd": "YYYY-MM-DD" (sama dengan dateStart jika hanya 1 hari, atau tanggal akhir jika rentang),
    "category": "salah satu dari: libur_nasional | libur_semester | mpls | asesmen | rapor | kegiatan_sekolah | khusus"
  }
]

Aturan Kategori:
- libur_nasional: Hari libur resmi keagamaan/nasional (misal: 17 Agustus, Idul Fitri, Natal, Waisak, Nyepi, Tahun Baru).
- libur_semester: Libur akhir semester 1 atau 2.
- mpls: Masa Pengenalan Lingkungan Sekolah.
- asesmen: Sumatif Tengah Semester (STS), Sumatif Akhir Semester (SAS), ANBK, Ujian Sekolah.
- rapor: Pembagian Rapor / Laporan Hasil Belajar.
- kegiatan_sekolah: Upacara, Pentas Seni, Pondok Ramadan, Outbound, Pembagian Tugas, dll.
- khusus: Kegiatan lainnya.

Aturan Tanggal:
- Pastikan format tanggalYYYY-MM-DD akurat berdasarkan Tahun Ajaran ${yearStart}/${yearEnd}.
- Bulan Juli s.d. Desember berada di tahun ${yearStart}.
- Bulan Januari s.d. Juni berada di tahun ${yearEnd}.
- Jika rentang tanggal seperti "14 - 16 Juli", buat dateStart="${yearStart}-07-14" dan dateEnd="${yearStart}-07-16".

HANYA KELUARKAN JSON VALID TANPA MARKDOWN MARKUP ATAU PENJELASAN LAINNYA.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "[]";
    let events = [];
    try {
      events = JSON.parse(responseText);
    } catch {
      events = [];
    }

    return res.json({ events });
  } catch (error: any) {
    console.error("AI Parse Error:", error);
    return res.status(500).json({
      error: error?.message || "Gagal memproses teks dengan AI.",
    });
  }
});

// Vite Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
