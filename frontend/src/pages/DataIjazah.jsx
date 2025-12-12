import { useEffect, useState } from "react";
import axios from "axios";
import { getIjazahList, deleteIjazah } from "../services/api";
import {
  Trash2,
  Download,
  Search,
  FileText,
  RefreshCw,
  GraduationCap,
  Calendar,
  BadgeCheck,
  User,
  FileCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function DataIjazah() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Filter States
  const [filterJenjang, setFilterJenjang] = useState("");
  const [filterSekolah, setFilterSekolah] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  // Options for Dropdowns
  // Options for Dropdowns
  const [optionSekolah, setOptionSekolah] = useState([]);
  const [optionJenjang, setOptionJenjang] = useState([]);
  const [optionTahun, setOptionTahun] = useState([]);

  useEffect(() => {
    loadData();
    if (
      user?.role === "admin_bos" ||
      user?.role === "super_admin" ||
      user?.role === "admin_ijazah"
    ) {
      loadFilterOptions();
    }
  }, [filterJenjang, filterSekolah, filterTahun, user]); // Reload when filters or user changes

  const loadFilterOptions = async () => {
    try {
      // Get Schools (You might want a dedicated API for this, reusing clustering/list logic or getting unique from ijazah)
      // For now, let's fetch from schools API we made earlier or use clustering/list to get school names
      const schoolsRes = await axios.get(
        "http://localhost:8000/api/schools.php"
      );
      if (schoolsRes.data.status) {
        const schools = schoolsRes.data.data;
        setOptionSekolah(schools);

        // Extract unique Jenjangs from schools
        const uniqueJenjangs = [
          ...new Set(schools.map((s) => s.jenjang).filter(Boolean)),
        ];
        setOptionJenjang(uniqueJenjangs.sort());
      }

      // Get Years (Distinct years from ijazah)
      const ijazahRes = await getIjazahList({});
      if (ijazahRes.status) {
        const allIjazah = ijazahRes.data;
        const uniqueYears = [
          ...new Set(allIjazah.map((item) => item.tahun).filter(Boolean)),
        ];
        setOptionTahun(uniqueYears.sort((a, b) => b - a)); // Sort descending
      }
    } catch (err) {
      console.error("Gagal memuat opsi filter");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};

      // Filter by school for operators
      if (user?.role === "operator_sekolah" && user?.nama_sekolah) {
        params.sekolah = user.nama_sekolah;
      }

      // Admin Filters
      if (filterJenjang) params.jenjang = filterJenjang;
      if (filterSekolah) params.sekolah = filterSekolah;
      if (filterTahun) params.tahun = filterTahun;

      const res = await getIjazahList(params);
      if (res.status) {
        setData(res.data);
      } else {
        console.error(res.message);
      }
    } catch (error) {
      console.error("Gagal memuat data");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal memuat data ijazah. Silakan coba lagi nanti.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Arsip Ini?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#fff",
      customClass: {
        popup: "rounded-2xl",
      },
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await deleteIjazah(id);
      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Arsip ijazah berhasil dihapus.",
          timer: 1500,
          showConfirmButton: false,
        });
        loadData();
      } else {
        Swal.fire("Gagal", res.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menghapus data", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nisn.includes(searchTerm) ||
      item.sekolah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen transition-colors duration-300 space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="w-full md:w-96 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center group focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <div className="pl-4 pr-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Cari Siswa, NISN, atau Sekolah..."
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 h-10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters for Admin */}
        {(user?.role === "admin_bos" ||
          user?.role === "super_admin" ||
          user?.role === "admin_ijazah") && (
          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
            {/* Jenjang Filter */}

            <select
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua Jenjang</option>
              {optionJenjang.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>

            {/* Sekolah Filter */}
            <select
              value={filterSekolah}
              onChange={(e) => setFilterSekolah(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 max-w-[150px]"
            >
              <option value="">Semua Sekolah</option>
              {optionSekolah.map((s) => (
                <option key={s.id} value={s.nama_sekolah}>
                  {s.nama_sekolah}
                </option>
              ))}
            </select>

            {/* Tahun Filter */}
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua Tahun</option>
              {optionTahun.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={loadData}
          className="p-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors flex gap-2 items-center text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-4">
            Mengambil data arsip...
          </p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center">
          <div className="mx-auto h-24 w-24 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Tidak ada data ditemukan
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Kami tidak dapat menemukan data yang cocok dengan "{searchTerm}".
            Coba kata kunci lain.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 dark:bg-gray-700/30">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider first:pl-8">
                    Identitas Siswa
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nomor Ijazah & NISN
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asal Sekolah
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider last:pr-8">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredData.map((item, i) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    <td className="px-6 py-4 first:pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shadow-sm">
                          {item.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                            {item.nama}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            {item.tanggal_lahir || "Tidak ada tanggal lahir"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono">
                          <FileText className="w-3 h-3" />
                          {item.nomor_ijazah}
                        </span>
                        <span className="text-xs text-gray-500 pl-1">
                          NISN:{" "}
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {item.nisn}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.sekolah}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Lulus {item.tahun}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right last:pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.file_path ? (
                          <a
                            href={`http://localhost:8000/api/download.php?id=${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-xl transition-all text-xs font-bold"
                            title="Download Scan Ijazah"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Unduh</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic px-3">
                            Tanpa File
                          </span>
                        )}

                        {user && user.role !== "super_admin" && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-2 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl transition-colors disabled:opacity-50"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/20 p-4 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-500">
            Menampilkan {filteredData.length} arsip ijazah
          </div>
        </div>
      )}
    </div>
  );
}
