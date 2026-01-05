import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const SchoolRadarChart = ({ school, clusterAvg, maxValues }) => {
  if (!school || !clusterAvg) return null;

  // Helper to normalize value to 0-100 scale relative to max in dataset
  const normalize = (val, key) => {
    const max = maxValues[key] || 1;
    // Prevent division by zero
    if (max === 0) return 0;
    return Math.round((val / max) * 100);
  };

  const data = [
    {
      subject: "Jml Siswa",
      A: normalize(school.jumlah_siswa, "jumlah_siswa"),
      B: normalize(clusterAvg.avgSiswa, "jumlah_siswa"),
      fullMark: 100,
    },
    {
      subject: "Jml Guru",
      A: normalize(school.jumlah_guru, "jumlah_guru"),
      B: normalize(clusterAvg.avgGuru, "jumlah_guru"),
      fullMark: 100,
    },
    {
      subject: "Dana BOS",
      A: normalize(school.dana_bos, "dana_bos"),
      B: normalize(clusterAvg.avgDana, "dana_bos"),
      fullMark: 100,
    },
    {
      subject: "R. Rusak",
      A: normalize(school.kondisi_fasilitas_rusak, "kondisi_fasilitas_rusak"),
      B: normalize(clusterAvg.avgRusak, "kondisi_fasilitas_rusak"),
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 rounded-xl p-4">
      <h4 className="text-center font-bold text-gray-700 dark:text-gray-200 mb-2">
        Diagnosa Kemiripan Karakteristik
      </h4>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#6B7280", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name={school.nama_sekolah}
              dataKey="A"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
            />
            <Radar
              name={`Rata-rata ${clusterAvg.name}`}
              dataKey="B"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "12px",
              }}
            />
            <Tooltip
              formatter={(value, name) => [value + " Poin", name]}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SchoolRadarChart;
