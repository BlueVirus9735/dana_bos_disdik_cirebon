import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadIjazah } from "../services/api";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Calendar,
  FileDigit,
  School,
  ArrowLeft,
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

export default function UploadIjazah() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    nisn: "",
    tanggal_lahir: "",
    nama_orang_tua: "",
    nomor_ijazah: "",
    sekolah: "",
    sekolah: "",
    tahun: "",
  });

  // Auto-fill school for operators
  React.useEffect(() => {
    if (user?.role === "operator_sekolah" && user?.nama_sekolah) {
      setFormData((prev) => ({
        ...prev,
        sekolah: user.nama_sekolah,
      }));
    }
  }, [user]);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "File Kosong",
        text: "Harap pilih file scan ijazah (PDF/Gambar) terlebih dahulu.",
        confirmButtonColor: "#F59E0B",
      });
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });
    form.append("file", file);

    setLoading(true);

    try {
      const result = await uploadIjazah(form);

      if (result.status) {
        Swal.fire({
          icon: "success",
          title: "Berhasil Disimpan!",
          text: "Data ijazah baru telah berhasil diarsipkan.",
          confirmButtonColor: "#10B981",
          timer: 2000,
        });

        // Reset form
        setFormData({
          nama: "",
          nisn: "",
          tanggal_lahir: "",
          nama_orang_tua: "",
          nomor_ijazah: "",
          sekolah: "",
          tahun: "",
        });
        setFile(null);
        setTimeout(() => navigate("/data-ijazah"), 2000);
      } else {
        throw new Error(result.message || "Gagal menyimpan data.");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Gagal",
        text: error.message || "Terjadi kesalahan koneksi ke server.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].size > 5 * 1024 * 1024) {
        Swal.fire(
          "File Terlalu Besar",
          "Maksimal ukuran file adalah 5MB",
          "warning"
        );
        return;
      }
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 5 * 1024 * 1024) {
        Swal.fire(
          "File Terlalu Besar",
          "Maksimal ukuran file adalah 5MB",
          "warning"
        );
        return;
      }
      setFile(e.target.files[0]);
    }
  };
  return (
    <div className="p-2 max-w-5xl mx-auto min-h-screen transition-colors duration-300 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10"
        >
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Identitas Siswa
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Contoh: Ahmad Fauzi"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    NISN
                  </label>
                  <input
                    type="text"
                    name="nisn"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Nomor Induk Siswa Nasional"
                    value={formData.nisn}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                    value={formData.tanggal_lahir}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    name="nama_orang_tua"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Nama lengkap orang tua"
                    value={formData.nama_orang_tua}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <FileDigit className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Detail Ijazah
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Nomor Ijazah
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="nomor_ijazah"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 font-mono"
                      placeholder="DN-XX/D-XXXXXXX"
                      value={formData.nomor_ijazah}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Asal Sekolah
                  </label>
                  <div className="relative">
                    <School className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="sekolah"
                      placeholder="Nama Sekolah Asal"
                      value={formData.sekolah}
                      onChange={handleChange}
                      readOnly={user?.role === "operator_sekolah"}
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 ${
                        user?.role === "operator_sekolah"
                          ? "cursor-not-allowed opacity-70 bg-gray-100"
                          : ""
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Tahun Lulus
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="tahun"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="2024"
                      value={formData.tahun}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: File Upload & Actions */}
          <div className="flex flex-col h-full space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700/20 p-6 rounded-2xl h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                Upload Scan
              </h3>

              <div
                className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-300 relative overflow-hidden ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 scale-[0.98]"
                    : "border-gray-300 dark:border-gray-600 hover:border-emerald-300 hover:bg-white dark:hover:bg-gray-700/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />

                {file ? (
                  <div className="text-center animate-in zoom-in duration-300 z-0">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] mx-auto text-sm">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <span
                      className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold relative z-20 cursor-pointer hover:bg-red-200 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      Hapus File
                    </span>
                  </div>
                ) : (
                  <div className="text-center z-0">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 text-gray-400 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-bold mb-1">
                      Drag & Drop File
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      atau klik area ini untuk memilih
                    </p>
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-300 font-medium mr-1">
                        PDF
                      </span>
                      <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-300 font-medium mr-1">
                        JPG
                      </span>
                      <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                        PNG
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      Maksimal 5MB
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Simpan Arsip</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
