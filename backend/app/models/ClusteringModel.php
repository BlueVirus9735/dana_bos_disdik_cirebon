<?php
require_once __DIR__ . "/../config/database.php";

class ClusteringModel {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function saveRiwayat($jumlah_cluster, $keterangan = '', $silhouette_score = 0) {
        $sql = "INSERT INTO riwayat_clustering (jumlah_cluster, keterangan, silhouette_score, tanggal_proses) VALUES (:jumlah_cluster, :keterangan, :silhouette_score, NOW())";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':jumlah_cluster' => $jumlah_cluster,
            ':keterangan' => $keterangan,
            ':silhouette_score' => $silhouette_score
        ]);
        return $this->db->lastInsertId();
    }

    public function saveDetail($riwayat_id, $sekolah_eval_id, $cluster_label, $kategori, $jarak_ke_centroid = 0) {
        $stmtGet = $this->db->prepare("SELECT sekolah_id FROM data_evaluasi_bos WHERE id = :id");
        $stmtGet->execute([':id' => $sekolah_eval_id]);
        $row = $stmtGet->fetch();
        if (!$row) return false;

        $sql = "INSERT INTO detail_clustering (riwayat_id, sekolah_id, cluster_label, kategori_cluster, jarak_ke_centroid) VALUES (:riwayat_id, :sekolah_id, :cluster_label, :kategori, :jarak_ke_centroid)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':riwayat_id' => $riwayat_id,
            ':sekolah_id' => $row['sekolah_id'],
            ':cluster_label' => $cluster_label,
            ':kategori' => $kategori,
            ':jarak_ke_centroid' => $jarak_ke_centroid
        ]);
    }

    public function getResultByYear($tahun) {
        $search = "%Tahun $tahun%";
        $stmt = $this->db->prepare("SELECT * FROM riwayat_clustering WHERE keterangan LIKE :search ORDER BY id DESC LIMIT 1");
        $stmt->execute([':search' => $search]);
        $riwayat = $stmt->fetch();
        
        if ($riwayat) {
            $sqlDetails = "SELECT d.*, s.nama_sekolah, s.npsn 
                           FROM detail_clustering d 
                           JOIN sekolah_bos s ON d.sekolah_id = s.id 
                           WHERE d.riwayat_id = :riwayat_id";
            $stmtDetails = $this->db->prepare($sqlDetails);
            $stmtDetails->execute([':riwayat_id' => $riwayat['id']]);
            $details = $stmtDetails->fetchAll();
            return ['riwayat' => $riwayat, 'details' => $details];
        }
        return null;
    }

    public function getLatestResult() {
        $stmt = $this->db->query("SELECT * FROM riwayat_clustering ORDER BY id DESC LIMIT 1");
        $riwayat = $stmt->fetch();
        
        if ($riwayat) {
            $sqlDetails = "SELECT d.*, s.nama_sekolah, s.npsn 
                           FROM detail_clustering d 
                           JOIN sekolah_bos s ON d.sekolah_id = s.id 
                           WHERE d.riwayat_id = :riwayat_id";
            $stmtDetails = $this->db->prepare($sqlDetails);
            $stmtDetails->execute([':riwayat_id' => $riwayat['id']]);
            $details = $stmtDetails->fetchAll();
            return ['riwayat' => $riwayat, 'details' => $details];
        }
        return null;
    }
}
?>
