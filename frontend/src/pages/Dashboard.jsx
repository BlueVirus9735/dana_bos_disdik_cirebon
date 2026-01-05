import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
import AccreditationChart from "../components/dashboard/AccreditationChart";

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
      const res = await api.get("/dashboard.php");
      if (res.data.status === "success") {
        setStats(res.data.data);
      } else {
        setError(res.data.message || "Gagal mengambil data");
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300">
      <DashboardHeader user={user} />

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
            <DashboardStats user={user} stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AccreditationChart
                data={stats.charts.akreditasi_distribution}
                userRole={user?.role}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
