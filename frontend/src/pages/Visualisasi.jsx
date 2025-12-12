import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "lucide-react";

const COLORS = {
  "Prioritas Tinggi": "#EF4444", // Red
  "Prioritas Sedang": "#F59E0B", // Orange/Yellow
  "Prioritas Rendah": "#10B981", // Green
  "Cluster 0": "#3B82F6",
  "Cluster 1": "#F59E0B",
  "Cluster 2": "#EF4444",
};
const DEFAULT_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Visualisasi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/clustering/result.php"
      );
      if (response.data.status === "success") {
        setData(response.data.data);
        processChartData(response.data.data.details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (details) => {
    const counts = {};
    details.forEach((d) => {
      // Use 'kategori' from DB if available, otherwise fallback to cluster_label
      const label = d.kategori || `Cluster ${d.cluster_label}`;
      counts[label] = (counts[label] || 0) + 1;
    });

    const formatted = Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
      fill: COLORS[key] || DEFAULT_COLORS[0], // Assign semantic color
    }));
    setChartData(formatted);
  };

  useEffect(() => {
    fetchResult();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Visualisasi Data
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 ml-11">
          Grafik distribusi hasil segmentasi sekolah berdasarkan analisis
          K-Means.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Sedang memuat visualisasi...
          </p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Belum ada data visualisasi
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Hasil clustering belum tersedia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-500" />
              Proporsi Cluster
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
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
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
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
                    className="dark:stroke-gray-700"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
