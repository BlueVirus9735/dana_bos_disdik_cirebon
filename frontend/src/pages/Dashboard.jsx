import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  School,
  Activity,
  Award,
  TrendingUp,
  PieChart,
  Users,
  Calendar,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/dashboard.php");
      if (res.data.status === "success") {
        setStats(res.data.data);
      } else {
        setError(res.data.message || "Gagal mengambil data");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300">
      {/* Premium Header / Greeting Section */}
      <div className="relative bg-slate-50 pb-32 pt-12 overflow-hidden  shadow-2xl shadow-slate-200 dark:shadow-none mb-[-6rem] z-0">
        <div className="absolute inset-0 select-none pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-slate-900 opacity-90 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] z-20 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] z-20 -translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Selamat Datang, {user?.username || "Admin"}
            </h1>
            <p className="text-slate-300 text-lg max-w-xl">
              Sistem arsip digital Pendidikan dan pengelolaan dana Pendidikan
            </p>
          </div>

          <div className="hidden md:flex gap-3">
            <div className="text-right">
              <p className="text-white font-bold text-xl leading-none">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-slate-400 text-sm">
                Update Terakhir: Hari ini
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-6 md:p-8 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-4 animate-pulse">
              Sedang mengambil data analitik...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-800/30 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Gagal Memuat Data</h3>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
        ) : !stats ? (
          <div className="text-center py-20 text-gray-500">
            Belum ada data untuk ditampilkan.
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Ijazah Stats - Only for Super Admin & Admin Ijazah */}
              {["super_admin", "admin_ijazah"].includes(user?.role) && (
                <>
                  <StatsCard
                    title="Total Arsip Ijazah"
                    value={stats.counts.total_ijazah}
                    icon={<FileText className="w-7 h-7 text-white" />}
                    gradient="from-blue-500 to-indigo-600"
                    trend="Realtime"
                    trendLabel="data terverifikasi"
                    footerValue="+12% bulan ini"
                  />
                  {/* New Derived Stat for Ijazah: Most Active Year */}
                  <StatsCard
                    title="Dominasi Lulusan"
                    value={
                      stats.charts.ijazah_per_year.length > 0
                        ? stats.charts.ijazah_per_year.reduce((prev, current) =>
                            prev.value > current.value ? prev : current
                          ).name
                        : "-"
                    }
                    icon={<Award className="w-7 h-7 text-white" />}
                    gradient="from-cyan-500 to-blue-600"
                    trend="Tahun"
                    trendLabel="terbanyak"
                    footerValue="Puncak statistik"
                  />
                  {/* New Derived Stat for Ijazah: Recent Activity Count */}
                  <StatsCard
                    title="Aktivitas Baru"
                    value={stats.recent_docs.length}
                    icon={<Activity className="w-7 h-7 text-white" />}
                    gradient="from-indigo-500 to-violet-600"
                    trend="Dokumen"
                    trendLabel="baru ditambahkan"
                    footerValue="Dalam 7 hari terakhir"
                    isCount={true}
                  />
                </>
              )}

              {/* BOS Stats - Only for Super Admin & Admin BOS */}
              {["super_admin", "admin_bos"].includes(user?.role) && (
                <>
                  <StatsCard
                    title="Sekolah Terdaftar"
                    value={stats.counts.total_sekolah}
                    icon={<School className="w-7 h-7 text-white" />}
                    gradient="from-emerald-500 to-teal-600"
                    trend="Aktif"
                    trendLabel="dalam sistem"
                    footerValue="Data Terbaru"
                  />
                  <StatsCard
                    title="Total Dana BOS"
                    value={stats.counts.total_dana_bos}
                    isCurrency={true}
                    icon={<PieChart className="w-7 h-7 text-white" />}
                    gradient="from-orange-500 to-red-600"
                    trend="TA 2024"
                    trendLabel="total anggaran"
                    footerValue="Terserap Optimal"
                  />
                  <StatsCard
                    title="Total Siswa"
                    value={stats.counts.total_siswa}
                    icon={<Users className="w-7 h-7 text-white" />}
                    gradient="from-purple-500 to-pink-600"
                    trend="Terdata"
                    trendLabel="siswa aktif"
                    footerValue="Berdasarkan Dapodik"
                  />
                </>
              )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bar Chart - Ijazah Distribution - Hide for Admin BOS */}
              {["super_admin", "admin_ijazah"].includes(user?.role) && (
                <div
                  className={`bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 ${
                    user.role === "admin_ijazah"
                      ? "lg:col-span-3"
                      : "lg:col-span-2"
                  }`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Tren Kelulusan
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Distribusi jumlah ijazah berdasarkan tahun kelulusan.
                      </p>
                    </div>
                  </div>

                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.charts.ijazah_per_year}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient
                            id="barGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#6366f1"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#818cf8"
                              stopOpacity={0.3}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e5e7eb"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#6b7280",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ fill: "#eff6ff" }}
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            color: "#f8fafc",
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                          itemStyle={{ color: "#f8fafc" }}
                        />
                        <Bar
                          dataKey="value"
                          fill="url(#barGradient)"
                          radius={[8, 8, 0, 0]}
                          barSize={50}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Pie Chart - Akreditasi - Only for Super Admin & Admin BOS */}
              {["super_admin", "admin_bos"].includes(user?.role) && (
                <div
                  className={`bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col ${
                    user?.role === "admin_bos" ? "lg:col-span-3" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-500" />
                        Status Akreditasi
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Komposisi kualitas sekolah.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                    <div className="h-64 w-full">
                      {stats.charts.akreditasi_distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={stats.charts.akreditasi_distribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                              cornerRadius={6}
                            >
                              {stats.charts.akreditasi_distribution.map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                )
                              )}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-700">
                                      <p className="font-bold text-sm">
                                        {payload[0].name}
                                      </p>
                                      <p className="text-xs opacity-80">
                                        {payload[0].value} Sekolah
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </RePieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <p>Data Akreditasi Kosong</p>
                        </div>
                      )}

                      {/* Center Text */}
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          {stats.charts.akreditasi_distribution.reduce(
                            (acc, curr) => acc + curr.value,
                            0
                          )}
                        </span>
                        <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
                          Sekolah
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custom Legend */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {stats.charts.akreditasi_distribution.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-default"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            backgroundColor: COLORS[idx % COLORS.length],
                            boxShadow: `0 0 8px ${
                              COLORS[idx % COLORS.length]
                            }66`,
                          }}
                        ></span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate w-full">
                            {item.name}
                          </span>
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {item.value}{" "}
                            <span className="text-[10px] font-normal opacity-50">
                              Unit
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Items - Only show Ijazah activity to those who have access */}
            {["super_admin", "admin_ijazah"].includes(user?.role) && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Aktivitas Arsip Terbaru
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Update terakhir data ijazah masuk.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => (window.location.href = "/data-ijazah")}
                    className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:gap-2 transition-all px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    Lihat Semua
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stats.recent_docs.length > 0 ? (
                    stats.recent_docs.map((item, idx) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                          {item.nama ? item.nama.charAt(0) : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate text-base mb-1 group-hover:text-blue-600 transition-colors">
                            {item.nama}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                            {item.sekolah}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                              <School className="w-3 h-3 mr-1" />
                              Lulusan {item.tahun}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12 flex flex-col items-center opacity-60">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">
                        Belum ada arsip ijazah yang tersimpan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Modernized StatsCards Component
function StatsCard({
  title,
  value,
  icon,
  gradient,
  trend,
  trendLabel,
  footerValue,
  isCurrency = false,
  isCount = false,
}) {
  return (
    <div className="group relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
      {/* Dynamic Background Hover Effect */}
      <div
        className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      ></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div
          className={`w-14 h-14 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
        >
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          {isCurrency
            ? new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(value)
            : value}
        </h3>

        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center gap-2">
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient} w-2/3 rounded-full`}
            ></div>
          </div>
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
            {footerValue}
          </span>
        </div>
      </div>
    </div>
  );
}
