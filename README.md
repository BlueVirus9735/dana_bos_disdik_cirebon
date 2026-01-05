# 🎓 Sistem Informasi Dinas Pendidikan (SIPENDIK) - Clustering Dana BOS

**SIPENDIK** adalah platform digital modern yang dirancang untuk Dinas Pendidikan guna mengoptimalkan penyaluran dan pemetaan **Dana Bantuan Operasional Sekolah (BOS)** menggunakan kecerdasan buatan (**K-Means Clustering**).

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20PHP%20%7C%20MySQL-blue?style=for-the-badge&logo=react)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

---

## 🌟 Fitur Unggulan

### 1. 💰 Smart BOS Clustering (K-Means)

Sistem pendukung keputusan cerdas untuk menentukan prioritas bantuan sekolah secara objektif dan berbasis data.

- **🤖 Algoritma K-Means Otomatis**:
  - Mengelompokkan sekolah menjadi 3 klaster prioritas: **Tinggi, Sedang, Rendah**.
  - Analisis berbasis multi-dimensi: Jumlah Siswa & Guru, Dana BOS, dan Tingkat Kerusakan Fasilitas.
  - **Auto-Labeling**: Sistem otomatis memberikan label deskriptif pada setiap cluster.
- **📊 Visualisasi Data Interaktif**:
  - **Radar Chart Diagnosa**: Membandingkan karakteristik spesifik sekolah dengan rata-rata clusternya.
  - **Drill-down Exploration**: Fitur pencarian dan filter mendalam untuk menelusuri data sekolah per cluster.
  - **Trend Analysis**: Grafik tren untuk memantau perubahan kondisi sekolah antar periode.
- **🧮 Simulasi Anggaran ("What-If")**:
  - Memprediksi dampak perubahan anggaran atau perbaikan fasilitas terhadap skor prioritas.
  - Alat strategis untuk perencanaan alokasi dana yang lebih efektif.

### 2. � Manajemen Akses & Keamanan

- **Role Management**:
  - **Super Admin**: Akses penuh sistem.
  - **Admin BOS**: Verifikasi data dan pengaturan parameter clustering.
  - **Operator Sekolah**: Manajemen data sekolah masing-masing.
- **Security**: Autentikasi berbasis JWT (JSON Web Token) dengan enkripsi password yang aman.
- **Audit Log**: Pencatatan riwayat aktivitas pengguna untuk transparansi.

---

## 🛠️ Teknologi yang Digunakan

### Frontend (Modern UI/UX)

- **Framework**: [React.js](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Desain**: [Tailwind CSS](https://tailwindcss.com/) (Glassmorphism & Responsive)
- **Visualisasi**: [Recharts](https://recharts.org/) (Grafik Interaktif)

### Backend (Performance)

- **Bahasa**: PHP Native (Struktur MVC)
- **Database**: MySQL / MariaDB
- **Algoritma**: K-Means Clustering dengan Euclidean Distance

---

## 🚀 Cara Instalasi & Menjalankan

### Persyaratan Sistem

- Node.js (v16+)
- PHP (v7.4 / v8.0+)
- MySQL Server

### Langkah Instalasi

1. **Clone Repository**

   ```bash
   git clone https://github.com/BlueVirus9735/dana_bos_disdik_cirebon.git
   cd dana_bos_disdik_cirebon
   ```

2. **Setup Backend**

   - Import database `db_disdik.sql` (jika ada).
   - Atur koneksi database di `backend/config/database.php`.

3. **Setup Frontend**

   ```bash
   cd frontend
   npm install
   ```

4. **Menjalankan Aplikasi**
   - **Backend**: Pastikan service PHP/MySQL berjalan.
   - **Frontend**: `npm run dev`
   - Buka browser di `http://localhost:5173`.

---

## 👥 Kontribusi

Dikembangkan untuk mendukung transparansi dan efektivitas pengelolaan dana pendidikan.

> _"Keputusan Berbasis Data untuk Kualitas Pendidikan yang Lebih Baik."_
