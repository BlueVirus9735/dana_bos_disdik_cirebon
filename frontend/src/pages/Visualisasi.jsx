import React, { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  PieChart as PieIcon,
  BarChart as BarIcon,
  TrendingUp,
  Activity,
  Award,
  Info,
  Search,
  School,
  ChevronRight,
  Filter,
} from "lucide-react";

import TrendChart from "../components/charts/TrendChart";
import SchoolRadarChart from "../components/charts/SchoolRadarChart";

const COLORS = {
  "Prioritas Tinggi": "#EF4444", // Red
  "Prioritas Sedang": "#F59E0B", // Orange/Yellow
  "Prioritas Rendah": "#10B981", // Green
  "Prioritas Tinggi (Darurat)": "#EF4444",
  "Prioritas Sedang (Perlu Perhatian)": "#F59E0B",
  "Prioritas Rendah (Kondisi Baik)": "#10B981",
  "Cluster 0": "#10B981", // Map 0 to Green
  "Cluster 1": "#F59E0B", // Map 1 to Yellow
  "Cluster 2": "#EF4444", // Map 2 to Red
};
const DEFAULT_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Visualisasi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [clusterProfiles, setClusterProfiles] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Drill-down & Interaction State
  const [selectedClusterLabel, setSelectedClusterLabel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [maxValues, setMaxValues] = useState({});

  const fetchResult = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clustering/result.php");
      if (response.data.status === "success") {
        setData(response.data.data);
        processChartData(response.data.data.details);
        calculateClusterProfiles(response.data.data.details);
        calculateMaxValues(response.data.data.details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      const response = await api.get("/clustering/trend.php");
      if (response.data.status === "success") {
        setTrendData(response.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data tren:", err);
    }
  };

  const getFriendlyLabel = (originalLabel) => {
    if (!originalLabel) return "Unknown";
    if (originalLabel.includes("Prioritas")) return originalLabel;
    if (originalLabel.includes("0")) return "Prioritas Rendah (Kondisi Baik)";
    if (originalLabel.includes("1"))
      return "Prioritas Sedang (Perlu Perhatian)";
    if (originalLabel.includes("2")) return "Prioritas Tinggi (Darurat)";
    return originalLabel;
  };

  const processChartData = (details) => {
    const counts = {};
    details.forEach((d) => {
      let label = d.kategori || `Cluster ${d.cluster_label}`;
      label = getFriendlyLabel(label);
      counts[label] = (counts[label] || 0) + 1;
    });

    const formatted = Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
      fill:
        COLORS[key] ||
        COLORS[key.split(" ")[0] + " " + key.split(" ")[1]] ||
        DEFAULT_COLORS[0],
    }));
    setChartData(formatted);
    // Set default selected cluster for the drill-down view
    if (formatted.length > 0) {
      setSelectedClusterLabel(formatted[0].name);
    }
  };

  const calculateClusterProfiles = (details) => {
    const groups = {};
    details.forEach((d) => {
      let label = d.kategori || `Cluster ${d.cluster_label}`;
      label = getFriendlyLabel(label);

      if (!groups[label]) {
        groups[label] = {
          count: 0,
          totalSiswa: 0,
          totalGuru: 0,
          totalDana: 0,
          totalRusak: 0,
        };
      }

      groups[label].count += 1;
      groups[label].totalSiswa += parseInt(d.jumlah_siswa || 0);
      groups[label].totalGuru += parseInt(d.jumlah_guru || 0);
      groups[label].totalDana += parseFloat(d.dana_bos || 0);
      groups[label].totalRusak += parseInt(d.kondisi_fasilitas_rusak || 0);
    });

    const profiles = Object.keys(groups).map((key) => {
      const g = groups[key];
      return {
        name: key,
        avgSiswa: Math.round(g.totalSiswa / g.count),
        avgGuru: Math.round(g.totalGuru / g.count),
        avgDana: g.totalDana / g.count,
        avgRusak: Math.round(g.totalRusak / g.count),
        count: g.count,
      };
    });
    setClusterProfiles(profiles);
  };

  const calculateMaxValues = (details) => {
    let maxSiswa = 0;
    let maxGuru = 0;
    let maxDana = 0;
    let maxRusak = 0;

    details.forEach((d) => {
      maxSiswa = Math.max(maxSiswa, parseInt(d.jumlah_siswa || 0));
      maxGuru = Math.max(maxGuru, parseInt(d.jumlah_guru || 0));
      maxDana = Math.max(maxDana, parseFloat(d.dana_bos || 0));
      maxRusak = Math.max(maxRusak, parseInt(d.kondisi_fasilitas_rusak || 0));
    });

    setMaxValues({
      jumlah_siswa: maxSiswa,
      jumlah_guru: maxGuru,
      dana_bos: maxDana,
      kondisi_fasilitas_rusak: maxRusak,
    });
  };

  useEffect(() => {
    fetchResult();
    fetchTrendData();
  }, []);

  // Filtered Schools Logic
  const filteredSchools = useMemo(() => {
    if (!data?.details) return [];

    let filtered = data.details.filter((d) => {
      let label = d.kategori || `Cluster ${d.cluster_label}`;
      return getFriendlyLabel(label) === selectedClusterLabel;
    });

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          (d.nama_sekolah || "").toLowerCase().includes(lower) ||
          (d.npsn || "").includes(lower)
      );
    }
    return filtered;
  }, [data, selectedClusterLabel, searchTerm]);

  // Selected Profile for comparison
  const selectedClusterProfile = useMemo(() => {
    return clusterProfiles.find((p) => p.name === selectedClusterLabel);
  }, [clusterProfiles, selectedClusterLabel]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen transition-colors duration-300 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Visualisasi Data
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 ml-11">
          Analisis komprehensif hasil segmentasi sekolah (K-Means Clustering).
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Sedang memuat visualisasi...
          </p>
        </div>
      ) : !data ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Belum ada data visualisasi
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Hasil clustering belum tersedia. Silakan jalankan proses mining
            terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Silhouette Score
                  </p>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {parseFloat(data.riwayat.silhouette_score).toFixed(4)}
                  </h4>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1 relative z-10">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                <p>
                  {data.riwayat.silhouette_score > 0.5
                    ? "Kualitas cluster sangat baik (Terpisah Jelas)."
                    : data.riwayat.silhouette_score > 0.2
                    ? "Kualitas cluster cukup baik."
                    : "Kualitas cluster lemah (Terlalu Berimpit)."}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status Konvergensi
                  </p>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Optimal
                  </h4>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 relative z-10">
                Data telah dikelompokkan dengan variansi minimum dalam cluster.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                  <PieIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Distribusi
                  </p>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.riwayat.jumlah_cluster} Cluster
                  </h4>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 relative z-10">
                Terbagi menjadi{" "}
                {chartData.map((c) => c.name.split(" ")[1]).join(", ")}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-purple-500" />
                Proporsi Prioritas Sekolah
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={5}
                      onClick={(data) => {
                        setSelectedClusterLabel(data.name);
                        document
                          .getElementById("explorasi-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="cursor-pointer focus:outline-none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <BarIcon className="w-5 h-5 text-blue-500" />
                Jumlah Sekolah per Cluster
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 10 }}
                      interval={0}
                      tickFormatter={(val) =>
                        val.split(" ")[0] + " " + val.split(" ")[1]
                      }
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                      contentStyle={{ borderRadius: "12px", border: "none" }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      barSize={50}
                      onClick={(data) => {
                        setSelectedClusterLabel(data.name);
                        document
                          .getElementById("explorasi-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Profil Centroid Table */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Profil Centroid (Karakteristik Rata-Rata Cluster)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">Kategori</th>
                    <th className="px-6 py-4">Rata-rata Siswa</th>
                    <th className="px-6 py-4">Rata-rata Guru</th>
                    <th className="px-6 py-4">Rata-rata Kerusakan</th>
                    <th className="px-6 py-4 rounded-tr-xl">
                      Rata-rata Dana BOS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {clusterProfiles.map((profile, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${
                            profile.name.includes("Tinggi")
                              ? "bg-red-50 text-red-700 border-red-200"
                              : profile.name.includes("Sedang")
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}
                        >
                          {profile.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {profile.avgSiswa}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {profile.avgGuru}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {profile.avgRusak} Unit
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                        {formatCurrency(profile.avgDana)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DRIL DOWN SECTION */}
          <div
            id="explorasi-section"
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* List Sekolah */}
            <div className="xl:col-span-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[600px]">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Search className="w-5 h-5 text-indigo-600" />
                  Explorasi Sekolah
                </h3>

                {/* Filters */}
                <div className="space-y-3">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {chartData.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setSelectedClusterLabel(c.name);
                          setSelectedSchool(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                          ${
                            selectedClusterLabel === c.name
                              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama sekolah..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedSchool(school)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border
                        ${
                          selectedSchool?.npsn === school.npsn
                            ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 ring-1 ring-indigo-500"
                            : "bg-white border-transparent hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4
                            className={`font-semibold text-sm ${
                              selectedSchool?.npsn === school.npsn
                                ? "text-indigo-700 dark:text-indigo-400"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {school.nama_sekolah}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            NPSN: {school.npsn}
                          </p>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 mt-1 ${
                            selectedSchool?.npsn === school.npsn
                              ? "text-indigo-500"
                              : "text-gray-300"
                          }`}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    Tidak ada sekolah ditemukan.
                  </div>
                )}
              </div>
              <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
                Menampilkan {filteredSchools.length} sekolah
              </div>
            </div>

            {/* Detail Analysis */}
            <div className="xl:col-span-7 space-y-6">
              {selectedSchool && selectedClusterProfile ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <School className="w-5 h-5 text-indigo-500" />
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {selectedSchool.nama_sekolah}
                          </h3>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${
                              selectedClusterLabel.includes("Tinggi")
                                ? "bg-red-50 text-red-700 border-red-200"
                                : selectedClusterLabel.includes("Sedang")
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }`}
                        >
                          {selectedClusterLabel}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Dana BOS</p>
                        <p className="font-mono font-bold text-lg text-gray-800 dark:text-gray-200">
                          {formatCurrency(selectedSchool.dana_bos)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      {/* Radar Chart Integration */}
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-2 border border-blue-50 dark:border-gray-700">
                        <SchoolRadarChart
                          school={selectedSchool}
                          clusterAvg={selectedClusterProfile}
                          maxValues={maxValues}
                        />
                      </div>

                      {/* Contextual textual analysis */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          Analisis Karakteristik
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          Sekolah ini memiliki{" "}
                          <span className="font-semibold">
                            {parseInt(selectedSchool.jumlah_siswa)} siswa
                          </span>{" "}
                          dan{" "}
                          <span className="font-semibold">
                            {parseInt(selectedSchool.jumlah_guru)} guru
                          </span>
                          . Kondisi fasilitas rusak tercatat sebanyak{" "}
                          <span className="font-semibold text-red-500">
                            {selectedSchool.kondisi_fasilitas_rusak} unit
                          </span>
                          .
                        </p>

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                          <p className="text-sm text-indigo-800 dark:text-indigo-300 italic">
                            "Dibandingkan rata-rata cluster, sekolah ini
                            memiliki
                            {parseInt(selectedSchool.kondisi_fasilitas_rusak) >
                            selectedClusterProfile.avgRusak
                              ? " tingkat kerusakan fasilitas yang lebih tinggi. Perlu prioritas perbaikan."
                              : " tingkat kerusakan di bawah rata-rata cluster."}
                            "
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                            <p className="text-xs text-gray-500">Rasio G/S</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">
                              1 :{" "}
                              {Math.round(
                                selectedSchool.jumlah_siswa /
                                  (selectedSchool.jumlah_guru || 1)
                              )}
                            </p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                            <p className="text-xs text-gray-500">BOS / Siswa</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs mt-1">
                              {formatCurrency(
                                selectedSchool.dana_bos /
                                  (selectedSchool.jumlah_siswa || 1)
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Pilih Sekolah
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm">
                    Klik salah satu sekolah di daftar sebelah kiri untuk melihat
                    analisis mendalam menggunakan Radar Chart.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
            <TrendChart data={trendData} />
          </div>
        </div>
      )}
    </div>
  );
}
