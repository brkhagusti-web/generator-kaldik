import { useState } from "react";
import {
  AcademicYearConfig,
  KaldikEvent,
  SchoolIdentity,
} from "./types";
import { PRESET_EVENTS_2025_2026 } from "./data/presetTemplates";
import { validateCalendarData } from "./utils/calendarUtils";
import { PrintDocument } from "./components/PrintDocument";
import { SidebarEditor } from "./components/SidebarEditor";
import { ValidationBanner } from "./components/ValidationBanner";
import { EventModal } from "./components/EventModal";
import { AIImportModal } from "./components/AIImportModal";
import { Calendar, Printer, Sparkles, Plus, Layers, Eye } from "lucide-react";

export default function App() {
  // 1. School Identity State
  const [identity, setIdentity] = useState<SchoolIdentity>({
    schoolName: "SD NEGERI UTAMA DEMO",
    district: "KABUPATEN BOGOR",
    province: "JAWA BARAT",
    principalName: "Drs. H. Ahmad Sunarya, M.Pd.",
    principalNip: "19720315 199603 1 002",
    teacherName: "Siti Rahmawati, S.Pd.",
    teacherNip: "19880712 201101 2 005",
    teacherClass: "VI A",
    city: "Bogor",
    documentDate: "14 Juli 2025",
  });

  // 2. Academic Year Config State
  const [config, setConfig] = useState<AcademicYearConfig>({
    yearStart: 2025,
    yearEnd: 2026,
    monthOrder: "academic",
  });

  // 3. Calendar Events State
  const [events, setEvents] = useState<KaldikEvent[]>(PRESET_EVENTS_2025_2026);

  // 4. Modals State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<KaldikEvent> | null>(null);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string | undefined>(undefined);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Automated Validation Check
  const validation = validateCalendarData(config.yearStart, config.yearEnd, events);

  // Handlers
  const handleAddEvent = () => {
    setEditingEvent(null);
    setSelectedDateForNewEvent(undefined);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (evt: KaldikEvent) => {
    setEditingEvent(evt);
    setIsEventModalOpen(true);
  };

  const handleDateClick = (dateStr: string) => {
    setEditingEvent(null);
    setSelectedDateForNewEvent(dateStr);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (evt: KaldikEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === evt.id);
      if (exists) {
        return prev.map((e) => (e.id === evt.id ? evt : e));
      }
      return [...prev, evt];
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleLoadPreset = (presetEvents: KaldikEvent[]) => {
    setEvents(presetEvents);
  };

  const handleImportAIEvents = (newEvents: KaldikEvent[]) => {
    setEvents((prev) => [...prev, ...newEvents]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Print-Only CSS Setup */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #kaldik-print-area {
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Navigation Topbar (Screen only) */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between print:hidden sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
            title="Toggle Sidebar Panel"
          >
            <Layers className="w-5 h-5 text-blue-400" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="font-extrabold text-sm text-white tracking-wide leading-tight">
                Generator Kalender Pendidikan SD
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                A4 Landscape 1-Page Official Educational Calendar
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-700 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">AI Parser</span>
          </button>

          <button
            onClick={handleAddEvent}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tambah Event</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg shadow-md cursor-pointer active:scale-95 transition-transform"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak (A4 Landscape)</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Drawer */}
        {isSidebarOpen && (
          <aside className="w-80 flex-shrink-0 z-20 h-[calc(100vh-53px)]">
            <SidebarEditor
              identity={identity}
              onIdentityChange={setIdentity}
              config={config}
              onConfigChange={setConfig}
              events={events}
              onAddEventClick={handleAddEvent}
              onEditEventClick={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onLoadPreset={handleLoadPreset}
              onOpenAIModal={() => setIsAIModalOpen(true)}
              onPrintClick={handlePrint}
            />
          </aside>
        )}

        {/* Live Document Canvas */}
        <main className="flex-1 bg-slate-900 overflow-y-auto p-4 sm:p-6 print:p-0">
          <div className="max-w-6xl mx-auto space-y-3 print:max-w-none print:m-0 print:p-0">
            {/* Real-time Automated Validation Banner */}
            <div className="print:hidden">
              <ValidationBanner validation={validation} />
            </div>

            {/* Document Container Card */}
            <div className="bg-slate-800 rounded-xl p-2 sm:p-4 shadow-2xl border border-slate-700/60 print:bg-white print:p-0 print:border-none print:shadow-none">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-700/60 text-xs text-slate-400 print:hidden">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-slate-200 uppercase">
                    Tampilan Lembar Cetak A4 Landscape (1 Halaman)
                  </span>
                </div>
                <span className="text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md font-mono">
                  Tahun Ajaran {config.yearStart}/{config.yearEnd}
                </span>
              </div>

              {/* Printable Document Sheet */}
              <PrintDocument
                identity={identity}
                config={config}
                events={events}
                onDateClick={handleDateClick}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Add / Edit Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialEvent={editingEvent}
        defaultDate={selectedDateForNewEvent}
      />

      {/* AI Text Extractor Modal */}
      <AIImportModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onImportEvents={handleImportAIEvents}
        yearStart={config.yearStart}
        yearEnd={config.yearEnd}
      />
    </div>
  );
}
