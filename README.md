# 🎓 Sistem Informasi Dinas Pendidikan (SIPENDIK) - Clustering & Arsip Digital

**SIPENDIK** adalah platform digital terintegrasi Modern untuk Dinas Pendidikan yang menggabungkan kecerdasan buatan (**K-Means Clustering**) untuk pemetaan dana BOS dan sistem **Arsip Digital Ijazah/SKPI** yang aman.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20PHP%20%7C%20MySQL-blue?style=for-the-badge&logo=react)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

---

## 🌟 Fitur Unggulan

### 1. 💰 Smart BOS Clustering (K-Means)

Sistem pendukung keputusan untuk menentukan prioritas bantuan sekolah secara objektif.

- **🤖 Algoritma K-Means**: Mengelompokkan sekolah menjadi 3 klaster (Prioritas Tinggi, Sedang, Rendah) berdasarkan:
  - Jumlah Siswa & Guru
  - Dana BOS Diterima
  - Tingkat Kerusakan Fasilitas
- **📊 Visualisasi Data Interaktif**:
  - _New!_ **Radar Chart Diagnosa**: Analisis mendalam karakteristik per sekolah vs rata-rata cluster.
  - **Drill-down Exploration**: Cari dan filter sekolah berdasarkan nama/NPSN langsung dari grafik.
  - **Trend Analysis**: Grafik tren perubahan kondisi sekolah dari waktu ke waktu.
- **🧮 Simulasi Anggaran ("What-If")**:
  - Prediksi dampak perubahan anggaran terhadap skor prioritas sekolah.
  - Alat bantu perencanaan strategis bagi Dinas Pendidikan.

### 2. 📜 E-Arsip Ijazah & Penerbitan SKPI

Solusi end-to-end untuk manajemen dokumen kelulusan yang valid.

- **🔍 Smart Search**: Pencarian ijazah hitungan detik (Nama, NISN, Sekolah).
- **📝 Workflow SKPI**:
  - Pengajuan oleh Operator Sekolah (Upload Surat Hilang Kepolisian).
  - Verifikasi & Approval oleh Admin Dinas.
  - Cetak **Surat Keterangan Pengganti Ijazah (SKPI)** dengan nomor seri otomatis.
- **🛡️ Keamanan Dokumen**: Enkripsi token untuk validasi keaslian dokumen.

### 3. 🔐 Manajemen Akses & Keamanan

- **Multi-Role**: Super Admin, Admin BOS, Admin Ijazah, dan Operator Sekolah.
- **JWT Authentication**: Login aman dengan enkripsi standar industri.
- **Audit Log**: Mencatat aktivitas pengguna penting.

---

## 🛠️ Teknologi yang Digunakan

### Frontend (Modern UI/UX)

- **Framework**: [React.js](https://react.dev/) + [Vite](https://vitejs.dev/) (Super Cepat)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Desain Responsif & Clean)
- **Visualisasi**:
  - [Recharts](https://recharts.org/) (Grafik Dinamis & Radar Chart)
  - [Lucide React](https://lucide.dev/) (Ikon Vektor Modern)
- **Komponen UI**: Headless UI, Framer Motion (Animasi Halus).

### Backend (Robust API)

- **Bahasa**: PHP Native (Optimised for Performance, MVC Pattern).
- **Database**: MySQL / MariaDB.
- **API**: RESTful Architecture dengan respon JSON standar.

---

## 🚀 Cara Instalasi & Menjalankan

### Persyaratan Sistem

- Node.js (v16+)
- PHP (v7.4 / v8.0+)
- MySQL Server
- Composer (Opsional)

### Langkah Instalasi

1. **Clone Repository**

   ```bash
   git clone https://github.com/BlueVirus9735/dana_bos_disdik_cirebon.git
   cd dana_bos_disdik_cirebon
   ```

2. **Setup Backend**

   - Import database `db_disdik.sql` (jika ada) ke MySQL.
   - Sesuaikan konfigurasi database di `backend/config/database.php`.
   - Pastikan folder `backend/uploads` memiliki izin tulis (write permission).

3. **Setup Frontend**

   ```bash
   cd frontend
   npm install
   ```

4. **Menjalankan Aplikasi**
   - **Backend**: Pastikan server PHP berjalan (contoh via Laragon/XAMPP).
   - **Frontend**:
     ```bash
     npm run dev
     ```
   - Akses aplikasi di `http://localhost:5173`.

---

## 👥 Kontribusi

Dikembangkan oleh Tim Pengembang untuk Dinas Pendidikan.

> _"Mewujudkan Pengelolaan Pendidikan yang Transparan, Efektif, dan Berbasis Data."_
