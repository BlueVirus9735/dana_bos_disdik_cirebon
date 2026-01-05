import React from "react";
import {
  FileText,
  Award,
  Activity,
  School,
  PieChart,
  Users,
} from "lucide-react";
import StatsCard from "./StatsCard";

export default function DashboardStats({ user, stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}
