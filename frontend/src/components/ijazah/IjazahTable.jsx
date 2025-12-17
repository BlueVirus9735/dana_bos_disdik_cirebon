import React, { useState } from "react";
import {
  FileText,
  Calendar,
  Download,
  Trash2,
  GraduationCap,
  Search,
  Printer,
  Check,
  X,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { generateSecureToken } from "../../utils/secureToken";
import SKPIRequestModal from "./SKPIRequestModal";
import { api } from "../../services/api";
import Swal from "sweetalert2";

export default function IjazahTable({
  data,
  loading,
  searchTerm,
  user,
  onDelete,
  deletingId,
  onRefresh,
}) {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleOpenRequest = (item) => {
    setSelectedStudent(item);
    setRequestModalOpen(true);
  };

  const handleReview = async (id, action) => {
    const isApprove = action === "approve";
    const result = await Swal.fire({
      title: isApprove ? "Setujui Permohonan?" : "Tolak Permohonan?",
      text: isApprove
        ? "SKPI akan dapat dicetak oleh operator."
        : "Pengajuan akan dikembalikan.",
      icon: isApprove ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "#10B981" : "#EF4444",
      confirmButtonText: isApprove ? "Ya, Setujui" : "Tolak",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.post(`/skpi_action.php?action=${action}`, { id });
      if (res.data.status) {
        Swal.fire("Berhasil", res.data.message, "success");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan sistem", "error");
    }
  };

  if (loading) {
    return (
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
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center">
        <div className="mx-auto h-24 w-24 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-6">
          <Search className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Tidak ada data ditemukan
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Kami tidak dapat menemukan data yang cocok dengan "{searchTerm}". Coba
          kata kunci lain.
        </p>
      </div>
    );
  }

  return (
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
            {data.map((item, i) => (
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
                    {/* SKPI Actions */}
                    {(() => {
                      const status = item.skpi_status || "none";

                      if (status === "approved") {
                        return (
                          <button
                            onClick={() => {
                              const token = generateSecureToken(item.id);
                              window.open(
                                `http://localhost:8000/api/print_skpi.php?token=${token}`,
                                "_blank"
                              );
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-xl transition-all text-xs font-bold"
                            title="Cetak Surat Keterangan Pengganti Ijazah"
                          >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Cetak SKPI</span>
                          </button>
                        );
                      } else if (status === "pending") {
                        if (
                          user?.role === "admin_ijazah" ||
                          user?.role === "super_admin"
                        ) {
                          return (
                            <div className="flex gap-1">
                              <a
                                href={`/${item.file_surat_polisi || "#"}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 mr-1"
                                title="Lihat Surat Polisi"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleReview(item.id, "approve")}
                                className="px-2 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                title="Setujui"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReview(item.id, "reject")}
                                className="px-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                                title="Tolak"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                              <Clock className="w-3.5 h-3.5" />
                              Menunggu
                            </span>
                          );
                        }
                      } else {
                        // none or rejected
                        if (
                          ["admin_ijazah", "super_admin"].includes(user?.role)
                        ) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                              {status === "rejected"
                                ? "Pengajuan Ditolak"
                                : "Belum Diajukan"}
                            </span>
                          );
                        }
                        return (
                          <button
                            onClick={() => handleOpenRequest(item)}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 rounded-xl transition-all text-xs font-bold"
                            title={
                              status === "rejected"
                                ? "Pengajuan Ditolak. Ajukan Ulang?"
                                : "Ajukan Penerbitan SKPI"
                            }
                          >
                            <ShieldAlert className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {status === "rejected"
                                ? "Ajukan Ulang"
                                : "Ajukan SKPI"}
                            </span>
                          </button>
                        );
                      }
                    })()}

                    {item.file_path ? (
                      <a
                        href={`http://localhost:8000/api/download.php?id=${
                          item.id
                        }&token=${localStorage.getItem("token")}`}
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
                        onClick={() => onDelete(item.id)}
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
        Menampilkan {data.length} arsip ijazah
      </div>

      {selectedStudent && (
        <SKPIRequestModal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          studentId={selectedStudent.id}
          studentName={selectedStudent.nama}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
