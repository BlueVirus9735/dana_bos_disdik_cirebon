import React, { useState } from "react";
import axios from "axios";
import {
  Play,
  Settings,
  AlertCircle,
  CheckCircle,
  Database,
} from "lucide-react";

export default function ProsesKMeans() {
  const [k, setK] = useState(3);
  const [tahun, setTahun] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleProcess = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/clustering/process.php",
        {
          k: k,
          tahun: tahun,
        }
      );

      if (response.data.status === "success") {
        setResult(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memproses data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          Proses K-Means Clustering
        </h1>
        <p className="text-gray-500 dark:text-slate-400 max-w-2xl leading-relaxed ml-14">
          Jalankan algoritma untuk mengelompokkan sekolah berdasarkan data
          evaluasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Control Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-6 mb-2">
                <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Konfigurasi Parameter
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Atur input untuk proses analisis
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Jumlah Cluster (K)
                  </label>
                  <input
                    type="number"
                    value={k}
                    onChange={(e) => setK(e.target.value)}
                    min="2"
                    max="10"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Jumlah kelompok (Min: 2, Max: 10).
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tahun Data
                  </label>
                  <input
                    type="number"
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="2025"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tahun data evaluasi yang akan diproses.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Mulai Proses
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info / Result Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Default Info Card */}
          {!result && !error && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  <AlertCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Info Algoritma
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Sistem menggunakan algoritma K-Means untuk mengelompokkan
                    data. Hasil akan otomatis tersimpan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-6 animate-in slide-in-from-right fade-in duration-300">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                    Berhasil
                  </h3>
                </div>

                <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                  Proses clustering selesai dalam{" "}
                  <strong>{result.iterations} iterasi</strong>.
                  <br />
                  <span className="block mt-1">
                    Kualitas (Silhouette Score):{" "}
                    <strong>
                      {result.silhouette_score
                        ? parseFloat(result.silhouette_score).toFixed(4)
                        : "N/A"}
                    </strong>
                  </span>
                </p>

                <button className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:underline self-start">
                  Lihat Hasil Detail &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Error Card */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-2xl p-6 animate-in slide-in-from-right fade-in duration-300">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-bold text-red-900 dark:text-red-100">
                    Gagal
                  </h3>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
