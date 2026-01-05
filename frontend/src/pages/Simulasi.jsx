import React, { useState, useEffect } from "react";
import {
  Building2,
  Calculator,
  ArrowRight,
  RefreshCcw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Simulasi = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Simulation Inputs
  const [simDanaBos, setSimDanaBos] = useState(0);
  const [simSiswa, setSimSiswa] = useState(0);
  const [simRusak, setSimRusak] = useState(0);

  const [refreshId, setRefreshId] = useState(0);

  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await api.get("/clustering/result.php"); // Fetch latest clustering result to get list
      if (response.data.status === "success" && response.data.data.details) {
        setSchools(response.data.data.details);
      }
    } catch (error) {
      console.error("Failed to fetch schools", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolChange = (e) => {
    const id = e.target.value;
    setSelectedSchoolId(id);
    const school = schools.find((s) => s.sekolah_id == id); // Loose equality for ID match
    if (school) {
      setSelectedSchool(school);
      // Initialize sim inputs with current values
      setSimDanaBos(parseFloat(school.dana_bos));
      setSimSiswa(parseInt(school.jumlah_siswa));
      setSimRusak(parseInt(school.kondisi_fasilitas_rusak));
      setResult(null);
    }
  };

  const handleSimulate = async () => {
    if (!selectedSchoolId) return;

    setSimulating(true);
    // setResult(null); // Optional: Clear result to feel like a "fresh" run
    try {
      const payload = {
        sekolah_id: selectedSchoolId,
        params: {
          dana_bos: simDanaBos,
          jumlah_siswa: simSiswa,
          kondisi_fasilitas_rusak: simRusak,
        },
      };

      const response = await api.post("/clustering/simulate.php", payload);

      if (response.data.status === "success") {
        setResult(response.data.data);
        setRefreshId((prev) => prev + 1); // Trigger animation
      } else {
        alert(response.data.message || "Gagal menjalankan simulasi");
      }
    } catch (error) {
      console.error("Simulation failed", error);
      alert("Gagal menjalankan simulasi: " + error.message);
    } finally {
      setSimulating(false);
    }
  };

  const getFriendlyName = (label) => {
    if (label == 2) return "Prioritas Tinggi (Darurat)";
    if (label == 1) return "Prioritas Sedang (Perlu Perhatian)";
    if (label == 0) return "Prioritas Rendah (Kondisi Baik)";
    return `Cluster ${label}`;
  };

  const getClusterColor = (label) => {
    if (label == 2) return "text-red-600 bg-red-50 border-red-200";
    if (label == 1) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (label == 0) return "text-green-600 bg-green-50 border-green-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  // Chart Data Preparation
  const chartData = selectedSchool
    ? [
        {
          name: "Dana BOS (Juta)",
          Aktual: parseFloat(selectedSchool.dana_bos) / 1000000,
          Simulasi: simDanaBos / 1000000,
        },
        {
          name: "R. Rusak (Unit)",
          Aktual: parseInt(selectedSchool.kondisi_fasilitas_rusak),
          Simulasi: simRusak,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-1 space-y-6">
          {/* SCHOOL SELECTOR */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Pilih Sekolah Target
            </label>
            {loading ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
            ) : (
              <select
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                onChange={handleSchoolChange}
                value={selectedSchoolId}
              >
                <option value="">-- Pilih Sekolah --</option>
                {schools.map((s) => (
                  <option key={s.sekolah_id} value={s.sekolah_id}>
                    {s.nama_sekolah}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedSchool && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-indigo-500" />
                Parameter Simulasi
              </h3>

              {/* DANA BOS SLIDER */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-gray-600">
                    Alokasi Dana BOS
                  </label>
                  <span className="text-sm font-bold text-indigo-600">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(simDanaBos)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000000000"
                  step="10000000"
                  value={simDanaBos}
                  onChange={(e) => setSimDanaBos(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Geser untuk menambah/mengurangi anggaran.
                </p>
              </div>

              {/* RUSAK SLIDER */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-gray-600">
                    Kondisi Rusak (Perbaikan)
                  </label>
                  <span className="text-sm font-bold text-red-500">
                    {simRusak} Unit
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={
                    selectedSchool
                      ? parseInt(selectedSchool.kondisi_fasilitas_rusak) + 20
                      : 100
                  }
                  value={simRusak}
                  onChange={(e) => setSimRusak(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Simulasi perbaikan: Kurangi jumlah rusak.
                </p>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center gap-2"
              >
                {simulating ? "Menghitung..." : "Jalankan Simulasi"}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedSchool ? (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 p-12">
              <Building2 className="w-16 h-16 mb-4 opacity-20" />
              <p>Pilih sekolah di panel kiri untuk memulai simulasi.</p>
            </div>
          ) : (
            <>
              {/* HEAD TO HEAD COMPARISON CARD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CURRENT STATE */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Building2 className="w-24 h-24" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Kondisi Saat Ini
                  </p>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {selectedSchool.nama_sekolah}
                  </h2>

                  <div
                    className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border ${getClusterColor(
                      selectedSchool.cluster_label
                    )}`}
                  >
                    {getFriendlyName(selectedSchool.cluster_label)}
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Dana BOS:</span>
                      <span className="font-mono font-semibold">
                        {new Intl.NumberFormat("id-ID", {
                          compact: "short",
                          currency: "IDR",
                        }).format(selectedSchool.dana_bos)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>R. Rusak:</span>
                      <span className="font-semibold text-red-500">
                        {selectedSchool.kondisi_fasilitas_rusak} Unit
                      </span>
                    </div>
                  </div>
                </div>

                {/* PREDICTION STATE */}
                <div
                  className={`bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 ${
                    result
                      ? "border-indigo-500 shadow-indigo-100 ring-4 ring-indigo-50"
                      : "border-dashed border-gray-200"
                  } shadow-sm relative overflow-hidden transition-all duration-500`}
                >
                  {simulating ? (
                    <div className="flex flex-col items-center justify-center h-full text-indigo-500 animate-pulse">
                      <RefreshCcw className="w-10 h-10 mb-2 animate-spin" />
                      <p className="text-sm font-bold">
                        Menghitung Probabilitas...
                      </p>
                    </div>
                  ) : !result ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <TrendingUp className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm">Klik "Jalankan Simulasi"</p>
                    </div>
                  ) : (
                    <div
                      key={refreshId}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Calculator className="w-24 h-24 text-indigo-600" />
                      </div>
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
                        Hasil Prediksi
                      </p>
                      <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">
                        Status Baru
                      </h2>

                      <div
                        className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border ${getClusterColor(
                          result.cluster_label
                        )}`}
                      >
                        {result.kategori}
                      </div>

                      {/* CHANGE INDICATOR */}
                      {result.cluster_label != selectedSchool.cluster_label ? (
                        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-start gap-2 text-sm">
                          <TrendingUp className="w-5 h-5 flex-shrink-0" />
                          <div>
                            <span className="font-bold">
                              Perubahan Signifikan!
                            </span>
                            <p className="text-xs mt-1">
                              Intervensi ini berhasil mengubah kategori sekolah.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-gray-50 text-gray-600 rounded-lg flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                          <div>
                            <span className="font-bold">Status Tetap</span>
                            <p className="text-xs mt-1">
                              Intervensi belum cukup mengubah kategori (Cluster{" "}
                              {result.cluster_label}). Coba nilai yang lebih
                              ekstrim.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CHART COMPARISON */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 shadow-sm h-80">
                <h3 className="font-bold text-gray-700 mb-6">
                  Visualisasi Perbandingan
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    width={500}
                    height={300}
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="Aktual"
                      fill="#9CA3AF"
                      name="Kondisi Awal"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Simulasi"
                      fill="#4F46E5"
                      name="Simulasi Intervensi"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulasi;
