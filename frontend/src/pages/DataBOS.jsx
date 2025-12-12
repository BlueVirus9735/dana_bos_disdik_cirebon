import React, { useState, useEffect } from "react";
import axios from "axios";
import { read, utils } from "xlsx";
import Swal from "sweetalert2";
import {
  Upload,
  RefreshCw,
  Plus,
  X,
  School,
  Database,
  Search,
  Edit,
  FileSpreadsheet,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DataBOS() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    nama_sekolah: "",
    npsn: "",
    alamat: "",
    tahun: new Date().getFullYear(),
    jumlah_siswa: 0,
    jumlah_guru: 0,
    jumlah_rombel: 0,
    dana_bos: 0,
    kondisi_fasilitas_rusak: 0,
    akreditasi: "Belum",
    status: "DRAFT",
  });

  // Pre-fill data for operators
  useEffect(() => {
    if (isModalOpen && user?.role === "operator_sekolah" && !isEditing) {
      setFormData((prev) => ({
        ...prev,
        nama_sekolah: user.nama_sekolah || "",
        npsn: user.npsn || "",
        sekolah_id: user.sekolah_id,
      }));
    }
  }, [isModalOpen, user, isEditing]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/clustering/list.php";
      if (user?.role === "operator_sekolah" && user?.sekolah_id) {
        url += `?sekolah_id=${user.sekolah_id}`;
      }

      const response = await axios.get(url);
      if (response.data.status === "success" || response.data.status === true) {
        setData(response.data.data || []);
      } else {
        setData(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Mengambil Data",
        text: "Terjadi kesalahan saat menghubungkan ke server.",
        confirmButtonColor: "#EF4444",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    try {
      let fileToUpload = file;

      // Check if file is Excel
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const data = await file.arrayBuffer();
        const workbook = read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const csvData = utils.sheet_to_csv(worksheet);

        const blob = new Blob([csvData], { type: "text/csv" });
        fileToUpload = new File([blob], "converted_data.csv", {
          type: "text/csv",
        });
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const response = await axios.post(
        "http://localhost:8000/api/clustering/upload.php",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Upload Berhasil",
        text: response.data.message,
        confirmButtonColor: "#3B82F6",
      });
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Gagal",
        text: err.response?.data?.message || err.message,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleManualSubmit = async (e, targetStatus = "DRAFT") => {
    e.preventDefault();
    setUploading(true);
    try {
      let url = "http://localhost:8000/api/clustering/create.php";

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== null &&
          formData[key] !== undefined &&
          key !== "file_bukti"
        ) {
          data.append(key, formData[key]);
        }
      });
      data.append("status", targetStatus);
      if (formData.file_bukti) {
        data.append("file_bukti", formData.file_bukti);
      }

      // Ensure sekolah_id is passed if user is operator
      if (user?.role === "operator_sekolah") {
        data.append("sekolah_id", user.sekolah_id);
      }

      if (isEditing) {
        url = "http://localhost:8000/api/clustering/update.php";
        data.append("id", editId);
      }

      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success" || response.data.status === true) {
        Swal.fire({
          icon: "success",
          title: isEditing ? "Data Diperbarui" : "Data Disimpan",
          text: "Informasi sekolah berhasil disimpan ke database.",
          showConfirmButton: false,
          timer: 1500,
        });
        setIsModalOpen(false);
        resetForm();
        fetchData();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: err.response?.data?.message || err.message,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (id, status) => {
    let catatan = "";
    if (status === "REJECTED") {
      const { value: text } = await Swal.fire({
        input: "textarea",
        inputLabel: "Alasan Penolakan",
        inputPlaceholder: "Tuliskan alasan penolakan...",
        inputAttributes: {
          "aria-label": "Tuliskan alasan penolakan",
        },
        showCancelButton: true,
      });
      if (text) {
        catatan = text;
      } else {
        return; // Cancelled
      }
    } else {
      const result = await Swal.fire({
        title: "Konfirmasi Verifikasi",
        text: "Apakah Anda yakin ingin menyetujui laporan ini?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Setujui",
        cancelButtonText: "Batal",
      });
      if (!result.isConfirmed) return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/clustering/verify.php",
        {
          id,
          status,
          catatan,
        }
      );
      if (response.data.status === "success" || response.data.status === true) {
        Swal.fire("Berhasil", response.data.message, "success");
        fetchData();
      } else {
        Swal.fire("Gagal", response.data.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan server", "error");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      nama_sekolah: item.nama_sekolah,
      npsn: item.npsn,
      alamat: item.alamat || "",
      tahun: item.tahun,
      jumlah_siswa: item.jumlah_siswa,
      jumlah_guru: item.jumlah_guru,
      jumlah_rombel: item.jumlah_rombel,
      dana_bos: item.dana_bos,
      kondisi_fasilitas_rusak: item.kondisi_fasilitas_rusak,
      akreditasi: item.akreditasi,
    });
    setEditId(item.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nama_sekolah: "",
      npsn: "",
      alamat: "",
      tahun: new Date().getFullYear(),
      jumlah_siswa: 0,
      jumlah_guru: 0,
      jumlah_rombel: 0,
      dana_bos: 0,
      kondisi_fasilitas_rusak: 0,
      akreditasi: "Belum",
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEvidenceFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file_bukti: e.target.files[0],
    }));
  };

  // Filter Data
  const filteredData = data.filter(
    (item) =>
      item.nama_sekolah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.npsn.includes(searchTerm)
  );

  return (
    <div className="p-2 max-w-7xl mx-auto space-y-8 min-h-screen transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="pl-4 pr-2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Cari nama sekolah atau NPSN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 h-10"
          />
        </div>

        <div className="flex gap-3 justify-end items-center">
          {user && user.role !== "super_admin" && (
            <>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                <span>Tambah Manual</span>
              </button>
            </>
          )}
          <button
            onClick={fetchData}
            className="p-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Hidden Form for Upload Logic Compatibility */}
        {file && (
          <div className="lg:col-span-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  File terpilih: <span className="font-bold">{file.name}</span>
                </span>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                {uploading ? "Mengupload..." : "Upload Sekarang"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Daftar Sekolah & Anggaran
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-5 first:pl-8">Sekolah / NPSN</th>
                <th className="px-6 py-5">Tahun</th>
                <th className="px-6 py-5 text-right">Statistik</th>
                <th className="px-6 py-5 text-right">Dana BOS</th>
                <th className="px-6 py-5 text-center">Fasilitas</th>
                <th className="px-6 py-5 text-center">Akreditasi</th>
                {user && user.role !== "super_admin" && (
                  <th className="px-6 py-5 text-center last:pr-8">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="font-medium">Memuat data sekolah...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                      <Database className="w-12 h-12 text-gray-300" />
                      <p>Tidak ada data yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4 first:pl-8">
                      <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {item.nama_sekolah}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        {item.npsn}
                      </div>
                      <div className="mt-1">
                        {item.status === "PENDING_VERIF" && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
                            Menunggu Verifikasi
                          </span>
                        )}
                        {item.status === "APPROVED" && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                            Terverifikasi
                          </span>
                        )}
                        {item.status === "REJECTED" && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                            Ditolak
                          </span>
                        )}
                        {item.status === "DRAFT" && (
                          <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                            Draft
                          </span>
                        )}
                      </div>
                      {item.file_bukti_path && (
                        <a
                          href={`http://localhost:8000/${item.file_bukti_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 text-[10px] flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <FileSpreadsheet className="w-3 h-3" /> Bukti BKU
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300">
                        {item.tahun}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-end gap-2 text-gray-500">
                          <span>Siswa:</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {item.jumlah_siswa}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2 text-gray-500">
                          <span>Guru:</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {item.jumlah_guru}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(item.dana_bos)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                            ${
                              item.kondisi_fasilitas_rusak > 50
                                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                : item.kondisi_fasilitas_rusak > 20
                                ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                      >
                        {item.kondisi_fasilitas_rusak > 20 ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {item.kondisi_fasilitas_rusak} Unit
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block w-8 h-8 leading-8 text-center rounded-lg text-xs font-bold ring-2 ring-white dark:ring-gray-800
                            ${
                              item.akreditasi === "A"
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                : item.akreditasi === "B"
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                                : item.akreditasi === "C"
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                      >
                        {item.akreditasi === "Tidak Terakreditasi"
                          ? "-"
                          : item.akreditasi}
                      </span>
                    </td>
                    {user && user.role !== "super_admin" && (
                      <td className="px-6 py-4 text-center last:pr-8">
                        {/* Logic for Operators: Edit if Draft or Rejected */}
                        {user.role === "operator_sekolah" &&
                          (item.status === "DRAFT" ||
                            item.status === "REJECTED") && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
                              title="Edit Data"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                        {/* Logic for Admins: Approve/Reject if Pending */}
                        {(user.role === "admin_bos" ||
                          user.role === "super_admin") &&
                          item.status === "PENDING_VERIF" && (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleVerify(item.id, "APPROVED")
                                }
                                className="p-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-xl transition-colors"
                                title="Setujui"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleVerify(item.id, "REJECTED")
                                }
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-xl transition-colors"
                                title="Tolak"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                        {/* Fallback for Admins to Edit if needed (optional) */}
                        {(user.role === "admin_bos" ||
                          user.role === "super_admin") &&
                          item.status !== "PENDING_VERIF" && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700/30 dark:text-gray-400 rounded-xl transition-colors"
                              title="Edit Admin"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal with Dual Theme Support */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 border border-white/20 dark:border-white/10">
            {/* Modal Header */}
            <div className="px-8 py-6 flex justify-between items-center shrink-0 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    isEditing
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500"
                  }`}
                >
                  {isEditing ? (
                    <Edit className="w-6 h-6" />
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {isEditing
                      ? "Perbarui Data Sekolah"
                      : "Tambah Data Sekolah"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                    {isEditing
                      ? "Silakan edit informasi di bawah ini."
                      : "Masukkan informasi sekolah baru ke database."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleManualSubmit}
              className="p-8 overflow-y-auto custom-scrollbar"
            >
              <div className="grid grid-cols-12 gap-8">
                {/* Left Column: School Identity */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl space-y-5 border border-gray-100 dark:border-white/5">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <School className="w-4 h-4 text-blue-500" /> Identitas
                      Sekolah
                    </h4>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide ml-1">
                          Nama Sekolah
                        </label>
                        <input
                          required
                          name="nama_sekolah"
                          value={formData.nama_sekolah}
                          onChange={handleInputChange}
                          disabled={
                            isEditing || user?.role === "operator_sekolah"
                          }
                          className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium ${
                            isEditing || user?.role === "operator_sekolah"
                              ? "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed"
                              : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                          }`}
                          placeholder="Masukan nama sekolah"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide ml-1">
                            NPSN
                          </label>
                          <input
                            required
                            name="npsn"
                            value={formData.npsn}
                            onChange={handleInputChange}
                            disabled={
                              isEditing || user?.role === "operator_sekolah"
                            }
                            className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono font-medium ${
                              isEditing || user?.role === "operator_sekolah"
                                ? "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed"
                                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                            }`}
                            placeholder="8 Digit NPSN"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide ml-1">
                            Tahun Data
                          </label>
                          <input
                            type="number"
                            name="tahun"
                            value={formData.tahun}
                            onChange={handleInputChange}
                            disabled={isEditing}
                            className="w-full px-5 py-3.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-center font-bold text-gray-700 dark:text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide ml-1">
                          Alamat Lengkap
                        </label>
                        <textarea
                          required
                          name="alamat"
                          rows="2"
                          value={formData.alamat}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none font-medium bg-white dark:bg-slate-800 text-gray-700 dark:text-white leading-relaxed placeholder-gray-400 dark:placeholder-slate-500"
                          placeholder="Jalan, Desa/Kelurahan, Kecamatan..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-2xl space-y-5 border border-blue-100 dark:border-white/5">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 text-blue-500" /> Informasi
                      Anggaran
                    </h4>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide ml-1">
                        Dana BOS Diterima
                      </label>
                      <div className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center rounded-l-xl border-y border-l border-blue-200 dark:border-slate-600 group-focus-within:border-blue-500 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all">
                          Rp
                        </div>
                        <input
                          type="number"
                          name="dana_bos"
                          value={formData.dana_bos}
                          onChange={handleInputChange}
                          className="w-full pl-16 pr-5 py-4 border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-lg font-bold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Statistics & Accreditation & Upload */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                  {/* Data Statistik */}
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-6 border border-gray-100 dark:border-white/5 rounded-2xl space-y-5 shadow-sm">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Database className="w-4 h-4 text-emerald-500" /> Data
                      Statistik
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Jml Siswa
                        </label>
                        <input
                          type="number"
                          name="jumlah_siswa"
                          value={formData.jumlah_siswa}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Jml Guru
                        </label>
                        <input
                          type="number"
                          name="jumlah_guru"
                          value={formData.jumlah_guru}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Rombel
                        </label>
                        <input
                          type="number"
                          name="jumlah_rombel"
                          value={formData.jumlah_rombel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Rusak
                        </label>
                        <input
                          type="number"
                          name="kondisi_fasilitas_rusak"
                          value={formData.kondisi_fasilitas_rusak}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-bold text-red-600 dark:text-red-400 placeholder-red-900/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Akreditasi */}
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-6 border border-gray-100 dark:border-white/5 rounded-2xl space-y-4 shadow-sm">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider mb-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" /> Status
                      Akreditasi
                    </h4>
                    <div className="space-y-3">
                      {["A", "B", "C", "Tidak Terakreditasi"].map((opt) => (
                        <div
                          key={opt}
                          onClick={() =>
                            setFormData({ ...formData, akreditasi: opt })
                          }
                          className={`relative cursor-pointer group flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 ${
                            formData.akreditasi === opt
                              ? "bg-purple-50 dark:bg-purple-500/20 border-purple-500 shadow-sm"
                              : "hover:bg-gray-100 dark:hover:bg-white/5 border-gray-200 dark:border-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.akreditasi === opt
                                ? "border-purple-600 dark:border-purple-500"
                                : "border-gray-300 dark:border-slate-600"
                            }`}
                          >
                            {formData.akreditasi === opt && (
                              <div className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-500" />
                            )}
                          </div>
                          <span
                            className={`font-medium ${
                              formData.akreditasi === opt
                                ? "text-purple-700 dark:text-purple-400"
                                : "text-gray-600 dark:text-slate-400"
                            }`}
                          >
                            {opt === "Tidak Terakreditasi"
                              ? "Belum / Tidak Terakreditasi"
                              : `Terakreditasi ${opt}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dokumen Pendukung */}
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-6 border border-gray-100 dark:border-white/5 rounded-2xl space-y-4 shadow-sm">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider mb-2">
                      <FileSpreadsheet className="w-4 h-4 text-orange-500" />{" "}
                      Dokumen Pendukung (BKU)
                    </h4>
                    <input
                      type="file"
                      accept=".pdf,.xls,.xlsx,.csv,image/*"
                      onChange={handleEvidenceFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                    />
                    <p className="text-xs text-gray-400">
                      Upload bukti BKU atau laporan keuangan. Format: PDF,
                      Excel, atau Gambar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 -mx-8 -mb-8 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold transition-all"
                >
                  Batal
                </button>
                {/* Two Action Buttons: Draft vs Kirim */}
                {!isEditing ||
                (user?.role === "operator_sekolah" &&
                  (formData.status === "DRAFT" ||
                    formData.status === "REJECTED")) ? (
                  <>
                    <button
                      type="submit"
                      onClick={(e) => handleManualSubmit(e, "DRAFT")}
                      disabled={uploading}
                      className="px-6 py-2.5 rounded-xl bg-gray-600 text-white hover:bg-gray-700 font-bold shadow-lg shadow-gray-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {uploading ? "Menyimpan..." : "Simpan Draft"}
                    </button>
                    <button
                      type="submit"
                      onClick={(e) => handleManualSubmit(e, "PENDING_VERIF")}
                      disabled={uploading}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {uploading ? "Mengirim..." : "Kirim & Verifikasi"}
                    </button>
                  </>
                ) : (
                  // For Admins or when Editing approved data (if allowed)
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {uploading
                      ? "Menyimpan..."
                      : isEditing
                      ? "Perbarui Data"
                      : "Simpan Data"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
