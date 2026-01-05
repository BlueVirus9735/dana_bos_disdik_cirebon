import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <p className="text-gray-400">Belum ada data tren historis.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        Analisis Tren (Perubahan Status Sekolah)
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Memantau pergerakan jumlah sekolah di setiap kategori dari tahun ke
        tahun.
      </p>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
              className="dark:stroke-gray-700"
            />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              label={{
                value: "Jumlah Sekolah",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#9CA3AF" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />

            <Line
              type="monotone"
              dataKey="low"
              name="Prioritas Rendah (Baik)"
              stroke="#10B981" // Green
              strokeWidth={3}
              activeDot={{ r: 8 }}
              dot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="medium"
              name="Prioritas Sedang (Warning)"
              stroke="#F59E0B" // Orange
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="high"
              name="Prioritas Tinggi (Darurat)"
              stroke="#EF4444" // Red
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
