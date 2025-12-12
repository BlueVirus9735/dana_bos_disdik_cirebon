import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, LayoutGrid, Calendar, School } from "lucide-react";

export default function HasilKlaster() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const fetchResult = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/clustering/result.php?tahun=${tahun}`
      );
      if (response.data.status === "success") {
        setData(response.data.data);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [tahun]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <LayoutGrid className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Hasil Clustering
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 ml-11">
          Daftar sekolah berdasarkan kelompok hasil evaluasi
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Filter Tahun Hasil
        </label>
        <div className="flex gap-4">
          <input
            type="number"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            placeholder="2024"
            className="w-full md:w-48 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Loading hasil...
          </p>
        </div>
      ) : !data ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Belum ada hasil clustering
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Silakan jalankan proses clustering terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-sm font-bold">
                  Jumlah Cluster
                </div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {data.riwayat.jumlah_cluster}
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-sm font-bold">
                  Tanggal Proses
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {data.riwayat.tanggal_proses}
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-sm font-bold">
                  Total Sekolah
                </div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {data.details.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Detail Pembagian Cluster
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-lg shadow-green-500/20 font-bold">
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase tracking-wider text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4">Nama Sekolah</th>
                    <th className="px-6 py-4">NPSN</th>
                    <th className="px-6 py-4 text-center">Cluster Label</th>
                    <th className="px-6 py-4 text-center">Kategori (Saran)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.details.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {row.nama_sekolah}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {row.npsn}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shadow-sm
                                            ${
                                              row.cluster_label == 0
                                                ? "bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30"
                                                : row.cluster_label == 1
                                                ? "bg-purple-500 ring-4 ring-purple-100 dark:ring-purple-900/30"
                                                : "bg-orange-500 ring-4 ring-orange-100 dark:ring-orange-900/30"
                                            }`}
                        >
                          {row.cluster_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                          ${
                            row.cluster_label == 0
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : row.cluster_label == 1
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                          }
                        `}
                        >
                          {row.kategori_cluster ||
                            (row.cluster_label == 0
                              ? "Prioritas Rendah"
                              : row.cluster_label == 1
                              ? "Prioritas Sedang"
                              : "Prioritas Tinggi")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
