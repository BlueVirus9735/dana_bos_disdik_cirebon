# 🎓 Sistem Informasi Dinas Pendidikan (SIPENDIK)

**SIPENDIK** adalah platform digital terintegrasi yang dirancang untuk memodernisasi manajemen pendidikan di Dinas Pendidikan. Sistem ini menggabungkan pengelolaan **Dana Bantuan Operasional Sekolah (BOS)** berbasis kecerdasan buatan dan **Arsip Digital Ijazah** yang aman dan terstruktur.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20PHP%20%7C%20MySQL-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## 🌟 Fitur Utama & Modul

### 1. 💰 Manajemen Data BOS & Analisis Cerdas (K-Means)

Modul ini membantu Dinas Pendidikan dalam memetakan prioritas perbaikan sekolah secara objektif menggunakan algoritma _Machine Learning_.

- **📊 Dashboard Eksekutif**: Ringkasan statistik total dana, sebaran sekolah, dan status perbaikan dalam bentuk grafik interaktif.
- **📥 Input Data Fleksibel**:
  - Upload data massal via Excel/CSV.
  - Input manual dengan validasi _real-time_.
- **🤖 Clustering K-Means Otomatis**:
  - Mengelompokkan sekolah ke dalam 3 klaster prioritas: **Tinggi, Sedang, Rendah**.
  - Analisis berbasis 5 dimensi: Jumlah Siswa, Guru, Rombel, Dana BOS, dan Tingkat Kerusakan.
  - **Auto-Labeling**: Sistem cerdas yang menamai klaster berdasarkan karakteristik data (bukan sekadar C1/C2/C3).
- **📉 Visualisasi Data**: Scatter Plot & Bar Chart untuk membandingkan posisi sekolah antar klaster.
- **🏫 Master Data Fasilitas**: Standarisasi jenis kerusakan dan fasilitas untuk pelaporan yang konsisten.

### 2. 📜 E-Arsip Ijazah & SKPI (Surat Keterangan Pendamping Ijazah)

Solusi _end-to-end_ untuk penyimpanan, pencarian, dan penerbitan dokumen kelulusan yang valid dan aman.

- **🔍 Smart Search & Filtering**: Pencarian ijazah super cepat berdasarkan NISN, Nama, Sekolah, atau Tahun Lulus.
- **📂 Manajemen Arsip Digital**:
  - Upload hasil scan ijazah asli.
  - Penyimpanan terstruktur dengan validasi dokumen.
- **🛡️ Penerbitan SKPI (SOP Compliant)**:
  - **Alur Pengajuan**: Operator sekolah mengajukan SKPI dengan melampirkan **Surat Keterangan Kehilangan Kepolisian**.
  - **Verifikasi Bertingkat**: Admin Dinas memverifikasi dokumen sebelum menyetujui (Approve) atau menolak (Reject) dengan alasan.
  - **Cetak Secure**: SKPI hanya bisa dicetak setelah disetujui, dilengkapi dengan sistem pengomoran otomatis dan token keamanan.

### 3. 🔐 Keamanan & Hak Akses (Role-Based Access Control)

Sistem dilengkapi dengan keamanan tingkat tinggi untuk melindungi data sensitif siswa dan sekolah.

- **Role Management**:
  1.  **🦸‍♂️ Super Admin**: Kontrol penuh atas sistem, user, dan konfigurasi global.
  2.  **👮 Admin Ijazah**: Otoritas khusus untuk verifikasi SKPI dan manajemen arsip ijazah.
  3.  **👮 Admin BOS**: Otoritas khusus untuk verifikasi SKPI dan manajemen arsip ijazah.
  4.  **🏢 Operator Sekolah**: Akses terbatas untuk mengelola data sekolahnya sendiri (Privacy Protected).
- **Secure Authentication**: Login menggunakan Token JWT (JSON Web Token) dengan enkripsi password Bcrypt.
- **Secure Downloads**: Link download file dilindungi token verifikasi (mencegah akses langsung tanpa login).

---

## 🛠️ Stack Teknologi

Aplikasi ini dibangun menggunakan teknologi modern yang menjamin kecepatan, skalabilitas, dan kemudahan perawatan.

### Frontend (Antarmuka Pengguna)

- **Framework**: [React.js](https://react.dev/) (dengan Vite untuk performa kilat).
- **Desain UI**: **Glassmorphism Premium** menggunakan [Tailwind CSS](https://tailwindcss.com/).
- **Ikon**: [Lucide React](https://lucide.dev/) (Ikon vektor modern & ringan).
- **Interaktivitas**:
  - **SweetAlert2** untuk notifikasi yang elegan.
  - **Recharts** untuk visualisasi data statistik yang dinamis.
  - **Framer Motion** untuk animasi transisi yang halus.

### Backend (Server & Database)

- **Bahasa**: PHP Native (Terstruktur dengan pola MVC & REST API).
- **Database**: MySQL / MariaDB (Relasional).
- **Keamanan**:
  - **CORS Protection**: Proteksi ketat terhadap akses lintas domain yang tidak sah.
  - **SQL Injection Prevention**: Menggunakan PDO Prepared Statements.
  - **Secure Token**: Enkripsi XOR + Base64 untuk validasi dokumen.

---

## 🔄 Alur Kerja Sistem (Workflow)

### 🔹 Alur Clustering BOS

1.  **Input**: Data kondisi sekolah diinput ke sistem (via Excel/Form).
2.  **Processing**: Algoritma K-Means menghitung jarak centroid dan mengelompokkan data.
3.  **Result**: Sekolah dilabeli "Prioritas Tinggi/Sedang/Rendah".
4.  **Decision**: Dinas menggunakan data ini untuk alokasi perbaikan.

### 🔹 Alur Penerbitan SKPI (SOP)

1.  **Permohonan**: Orang tua melapor ke sekolah -> Operator Sekolah upload Surat Polisi ke sistem.
2.  **Verifikasi**: Status pengajuan menjadi "Pending" (Kuning). Admin Dinas menerima notifikasi.
3.  **Validasi Admin**:
    - Jika dokumen lengkap -> Klik **Approve** (Status jadi "Approved"/Hijau).
    - Jika kurang -> Klik **Reject** (Status jadi "Rejected"/Merah).
4.  **Pencetakan**: Tombol **"Cetak SKPI"** hanya muncul di akun Operator setelah status "Approved".
5.  **Output**: Dokumen PDF resmi dengan Tanda Tangan Kadis & Token Keamanan.

---

> _"Digitalisasi Pendidikan untuk Masa Depan yang Lebih Baik."_
