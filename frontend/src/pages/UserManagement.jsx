import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Users,
  Shield,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]); // New state for schools
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
    sekolah_id: "", // New field
    nama_sekolah: "",
    npsn: "",
    jenjang: "SD",
  });

  const [isNewSchool, setIsNewSchool] = useState(false);

  const apiUrl = "http://localhost:8000/api/users.php";

  useEffect(() => {
    fetchUsers();
    fetchSchools(); // Fetch schools on mount
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/schools.php");
      if (response.data.status) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl);
      if (response.data.status) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Edit mode
        const payload = { ...formData, new_school: isNewSchool };
        const response = await axios.put(
          `${apiUrl}?id=${editingUser.id}`,
          payload
        );
        if (response.data.status) {
          Swal.fire("Berhasil", "User berhasil diperbarui", "success");
        }
      } else {
        // Create mode
        const payload = { ...formData, new_school: isNewSchool };
        const response = await axios.post(apiUrl, payload);
        if (response.data.status) {
          Swal.fire("Berhasil", "User berhasil ditambahkan", "success");
        }
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        role: "user",
        sekolah_id: "",
        nama_sekolah: "",
        npsn: "",
        jenjang: "SD",
      });
      fetchUsers();
      fetchSchools(); // Refresh schools list to reflect any new/updated schools
    } catch (error) {
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // Password not shown for security, user can fill to change
      role: user.role,
      sekolah_id: user.sekolah_id || "",
      nama_sekolah: user.nama_sekolah || "",
      npsn: user.npsn || "",
      jenjang: user.jenjang || "SD",
    });
    // Optional: If you want to default to manual input if school exists but can be edited
    // setIsNewSchool(!!user.sekolah_id);
    // Usually keep it false unless user explicitly wants to check manual.
    // However, to make editing seeing the values EASIER, checking it might be better?
    // User complaint "tetap tidak terupdate" implies they tried manual input.
    // Let's NOT auto-check it to verify logic, OR check it if school exists?
    // Let's keep it unchecked by default, but fields are filled if they check it.
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data user akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${apiUrl}?id=${id}`);
        if (response.data.status) {
          Swal.fire("Terhapus!", "User telah dihapus.", "success");
          fetchUsers();
        }
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus user", "error");
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Manajemen User
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 ml-11">
            Kelola pengguna, role, dan hak akses aplikasi.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              username: "",
              password: "",
              role: "user",
              sekolah_id: "",
              nama_sekolah: "",
              npsn: "",
              jenjang: "SD",
            });
            setIsNewSchool(false);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          <span className="font-semibold">Tambah User</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            Daftar Pengguna
          </h2>
          <button
            onClick={fetchUsers}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <span>Memuat data user...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    Belum ada user yang terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium text-sm">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                        {user.username.substring(0, 2)}
                      </div>
                      {user.username}
                      {user.nama_sekolah && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
                          ({user.nama_sekolah})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border
                        ${
                          user.role === "super_admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                            : user.role === "admin_ijazah"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                            : user.role === "admin_bos"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl transform transition-all border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingUser ? "Edit User" : "Tambah User Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Password{" "}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                    {editingUser && "(Kosongkan jika tidak diubah)"}
                  </span>
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Masukkan password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="user">User Biasa</option>
                    <option value="operator_sekolah">
                      Operator Sekolah (Umum)
                    </option>
                    <option value="operator_bos">Operator BOS (Khusus)</option>
                    <option value="operator_ijazah">
                      Operator Ijazah (Khusus)
                    </option>
                    <option value="admin_ijazah">Admin Ijazah (Dinas)</option>
                    <option value="admin_bos">Admin BOS (Dinas)</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                        fillRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* School Dropdown - Only if role includes 'operator' */}
              {formData.role.includes("operator") && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="new_school"
                      checked={isNewSchool}
                      onChange={(e) => setIsNewSchool(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="new_school"
                      className="text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                    >
                      Input Sekolah Baru (Manual)
                    </label>
                  </div>

                  {!isNewSchool ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Pilih Sekolah
                      </label>
                      <div className="relative">
                        <select
                          value={formData.sekolah_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sekolah_id: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                          required={!isNewSchool}
                        >
                          <option value="">-- Pilih Sekolah --</option>
                          {schools.map((school) => (
                            <option key={school.id} value={school.id}>
                              {school.nama_sekolah} ({school.npsn})
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 dark:text-gray-400">
                          <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                              fillRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Nama Sekolah
                        </label>
                        <input
                          type="text"
                          value={formData.nama_sekolah}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nama_sekolah: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          placeholder="Contoh: SD Negeri 1 ..."
                          required={isNewSchool}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            NPSN
                          </label>
                          <input
                            type="text"
                            value={formData.npsn}
                            onChange={(e) =>
                              setFormData({ ...formData, npsn: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="Nomor NPSN"
                            required={isNewSchool}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Jenjang
                          </label>
                          <select
                            value={formData.jenjang}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                jenjang: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                            required={isNewSchool}
                          >
                            <option value="SD">SD</option>
                            <option value="SMP">SMP</option>
                            <option value="SMA">SMA</option>
                            <option value="SMK">SMK</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <Save size={18} />
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
