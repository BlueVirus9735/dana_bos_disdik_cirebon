import React from "react";
import { Download, FileText, Printer, FileSpreadsheet } from "lucide-react";

export default function Laporan() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Pusat Laporan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 ml-11">
          Unduh dan cetak laporan arsip, data evaluasi, dan hasil analisis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Laporan Ijazah */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col transition-colors hover:shadow-lg duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Laporan Data Ijazah
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">
            Rekapitulasi seluruh data ijazah yang telah diarsipkan. Tersedia
            dalam format PDF dan Excel.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl text-sm font-semibold transition-colors">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-xl text-sm font-semibold transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
          </div>
        </div>

        {/* Laporan BOS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col transition-colors hover:shadow-lg duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Laporan Evaluasi BOS
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">
            Data evaluasi penggunaan dana BOS sekolah, termasuk jumlah siswa,
            guru, dan fasilitas.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl text-sm font-semibold transition-colors">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-xl text-sm font-semibold transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
          </div>
        </div>

        {/* Laporan Clustering */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col transition-colors hover:shadow-lg duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Printer className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Hasil Analisis Klaster
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">
            Cetak hasil pengelompokan sekolah (Prioritas Tinggi, Sedang, Rendah)
            untuk rapat evaluasi.
          </p>
          <div className="w-full">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-xl text-sm font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" /> Cetak Halaman Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
