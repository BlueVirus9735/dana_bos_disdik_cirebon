import React, { useState, useMemo } from "react";
import {
  Download,
  Filter,
  Layers,
  AlertCircle,
  CheckCircle,
  Info,
  FileText,
  Eye,
  XCircle, // Changed from X to XCircle just to be safe
} from "lucide-react";
import { utils, write } from "xlsx";
import { generateSK } from "../../utils/generateSK";
import SchoolRadarChart from "../charts/SchoolRadarChart";

export default function KlasterTable({ data }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Memoize max values for normalization
  const maxValues = useMemo(() => {
    if (!data || !data.details) return {};
    const safeParseInt = (val) => parseInt(val || 0);
    const safeParseFloat = (val) => parseFloat(val || 0);

    return {
      jumlah_siswa: Math.max(
        ...data.details.map((d) => safeParseInt(d.jumlah_siswa))
      ),
      jumlah_guru: Math.max(
        ...data.details.map((d) => safeParseInt(d.jumlah_guru))
      ),
      dana_bos: Math.max(
        ...data.details.map((d) => safeParseFloat(d.dana_bos))
      ),
      kondisi_fasilitas_rusak: Math.max(
        ...data.details.map((d) => safeParseInt(d.kondisi_fasilitas_rusak))
      ),
    };
  }, [data]);

  // Memoize cluster averages
  const clusterAverages = useMemo(() => {
    if (!data || !data.details) return {};
    const groups = {};
    data.details.forEach((d) => {
      const label = d.cluster_label;
      if (!groups[label]) groups[label] = { count: 0, s: 0, g: 0, d: 0, r: 0 };
      groups[label].count++;
      groups[label].s += parseInt(d.jumlah_siswa || 0);
      groups[label].g += parseInt(d.jumlah_guru || 0);
      groups[label].d += parseFloat(d.dana_bos || 0);
      groups[label].r += parseInt(d.kondisi_fasilitas_rusak || 0);
    });

    const avgs = {};
    Object.keys(groups).forEach((k) => {
      const g = groups[k];
      avgs[k] = {
        name:
          k == 2
            ? "Prioritas Tinggi"
            : k == 1
            ? "Prioritas Sedang"
            : "Prioritas Rendah",
        avgSiswa: Math.round(g.s / g.count),
        avgGuru: Math.round(g.g / g.count),
        avgDana: Math.round(g.d / g.count),
        avgRusak: Math.round(g.r / g.count),
      };
    });
    return avgs;
  }, [data]);

  if (!data || !data.details) return null;

  // Logic Filtering (Mapping Cluster ID ke Kategori)
  const filteredData = data.details.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "tinggi") return item.cluster_label == 2;
    if (activeTab === "sedang") return item.cluster_label == 1;
    if (activeTab === "rendah") return item.cluster_label == 0;
    return true;
  });

  const getFriendlyName = (label) => {
    if (label == 2) return "Prioritas Tinggi (Darurat)";
    if (label == 1) return "Prioritas Sedang (Perlu Perhatian)";
    if (label == 0) return "Prioritas Rendah (Kondisi Baik)";
    return `Cluster ${label}`;
  };

  const currentCategoryName =
    activeTab === "all"
      ? "Semua Kategori"
      : activeTab === "tinggi"
      ? "Prioritas Tinggi"
      : activeTab === "sedang"
      ? "Prioritas Sedang"
      : "Prioritas Rendah";

  const handlePrintSK = () => {
    generateSK(filteredData, currentCategoryName, new Date().getFullYear());
  };

  const handleExport = () => {
    const header = [
      "Nama Sekolah",
      "NPSN",
      "Cluster Label",
      "Kategori",
      "Jarak ke Centroid",
    ];
    const rows = filteredData.map((item) => [
      item.nama_sekolah,
      item.npsn,
      item.cluster_label,
      getFriendlyName(item.cluster_label),
      item.jarak_ke_centroid,
    ]);

    const worksheet = utils.aoa_to_sheet([header, ...rows]);
    const workbook = utils.book_new();

    const sheetName =
      activeTab === "all"
        ? "Semua Sekolah"
        : activeTab === "tinggi"
        ? "Prioritas Tinggi"
        : activeTab === "sedang"
        ? "Prioritas Sedang"
        : "Prioritas Rendah";

    utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

    const wbout = write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Data_Clustering_${activeTab}_${new Date().getFullYear()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Daftar Sekolah Terklaster
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Pilih kategori tab untuk melihat daftar sekolah spesifik.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrintSK}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-500/20 font-bold"
            >
              <FileText className="w-4 h-4" />
              Cetak SK (PDF)
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-lg shadow-green-500/20 font-bold"
            >
              <Download className="w-4 h-4" />
              Export Excel ({filteredData.length})
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl w-fit">
          {[
            { id: "all", label: "Semua Sekolah", icon: Layers },
            { id: "tinggi", label: "Prioritas Tinggi", icon: AlertCircle },
            { id: "sedang", label: "Prioritas Sedang", icon: Info },
            { id: "rendah", label: "Prioritas Rendah", icon: CheckCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <tab.icon
                className={`w-4 h-4 ${
                  activeTab === tab.id
                    ? tab.id === "tinggi"
                      ? "text-red-500"
                      : tab.id === "sedang"
                      ? "text-yellow-500"
                      : tab.id === "rendah"
                      ? "text-green-500"
                      : "text-indigo-500"
                    : ""
                }`}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">Nama Sekolah</th>
              <th className="px-6 py-4 text-center">NPSN</th>
              <th className="px-6 py-4">Status Prioritas</th>
              <th className="px-6 py-4 text-center">Jarak (Distance)</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {item.nama_sekolah}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 font-mono">
                    {item.npsn}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        item.cluster_label == 2
                          ? "bg-red-50 text-red-700 border-red-200"
                          : item.cluster_label == 1
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.cluster_label == 2
                            ? "bg-red-500"
                            : item.cluster_label == 1
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></span>
                      {getFriendlyName(item.cluster_label)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">
                    {parseFloat(item.jarak_ke_centroid).toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedSchool(item)}
                      className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                      title="Bedah Sekolah (Inspect)"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  Tidak ada data sekolah untuk kategori ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL BEDAH SEKOLAH */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Bedah Sekolah: {selectedSchool.nama_sekolah}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  NPSN: {selectedSchool.npsn} •{" "}
                  {getFriendlyName(selectedSchool.cluster_label)}
                </p>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Profil Data
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-500 text-sm">
                        Jumlah Siswa
                      </span>
                      <span className="font-bold">
                        {selectedSchool.jumlah_siswa}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-500 text-sm">Jumlah Guru</span>
                      <span className="font-bold">
                        {selectedSchool.jumlah_guru}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-500 text-sm">R. Rusak</span>
                      <span className="font-bold text-red-500">
                        {selectedSchool.kondisi_fasilitas_rusak} Unit
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-500 text-sm">Dana BOS</span>
                      <span className="font-bold font-mono text-green-600">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(selectedSchool.dana_bos)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <SchoolRadarChart
                    school={selectedSchool}
                    clusterAvg={clusterAverages[selectedSchool.cluster_label]}
                    maxValues={maxValues}
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <h5 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Analisis Sistem
                </h5>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                  Sekolah ini masuk dalam kategori{" "}
                  <strong>
                    {getFriendlyName(selectedSchool.cluster_label)}
                  </strong>{" "}
                  karena memiliki karakteristik yang mendekati rata-rata
                  kelompok ini. Lihat grafik radar di atas untuk melihat faktor
                  dominan (titik sudut terluar) yang menyebabkan sekolah ini
                  diklasifikasikan demikian.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
