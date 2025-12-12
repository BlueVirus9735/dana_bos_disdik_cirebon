<?php
require_once __DIR__ . '/app/config/database.php';

try {
    $db = Database::connect();

    $sql1 = "CREATE TABLE IF NOT EXISTS sekolah_bos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_sekolah VARCHAR(255) NOT NULL,
        npsn VARCHAR(50) NOT NULL UNIQUE,
        alamat TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;";

    $sql2 = "CREATE TABLE IF NOT EXISTS data_evaluasi_bos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sekolah_id INT NOT NULL,
        tahun INT NOT NULL,
        jumlah_siswa INT NOT NULL,
        jumlah_guru INT NOT NULL,
        jumlah_rombel INT NOT NULL,
        dana_bos DECIMAL(20,2) NOT NULL,
        kondisi_fasilitas_rusak INT DEFAULT 0,
        akreditasi ENUM('A', 'B', 'C', 'Tidak Terakreditasi') DEFAULT 'Tidak Terakreditasi',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sekolah_id) REFERENCES sekolah_bos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";

    $sql3 = "CREATE TABLE IF NOT EXISTS riwayat_clustering (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tanggal_proses DATETIME DEFAULT CURRENT_TIMESTAMP,
        jumlah_cluster INT NOT NULL,
        silhouette_score DECIMAL(5,4),
        keterangan TEXT
    ) ENGINE=InnoDB;";

    $sql4 = "CREATE TABLE IF NOT EXISTS detail_clustering (
        id INT AUTO_INCREMENT PRIMARY KEY,
        riwayat_id INT NOT NULL,
        sekolah_id INT NOT NULL,
        cluster_label INT NOT NULL,
        jarak_ke_centroid DECIMAL(10,4),
        FOREIGN KEY (riwayat_id) REFERENCES riwayat_clustering(id) ON DELETE CASCADE,
        FOREIGN KEY (sekolah_id) REFERENCES sekolah_bos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";

    $db->exec($sql1);
    echo "Table 'sekolah_bos' ready.\n";
    $db->exec($sql2);
    echo "Table 'data_evaluasi_bos' ready.\n";
    $db->exec($sql3);
    echo "Table 'riwayat_clustering' ready.\n";
    $db->exec($sql4);
    echo "Table 'detail_clustering' ready.\n";

    echo "Database structure updated successfully.";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
