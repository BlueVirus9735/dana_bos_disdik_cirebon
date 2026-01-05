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
            // Enhanced query to fetch feature data for visualization
            $sqlDetails = "SELECT 
                                d.*, 
                                s.nama_sekolah, 
                                s.npsn,
                                e.jumlah_siswa,
                                e.jumlah_guru,
                                e.jumlah_rombel,
                                e.dana_bos,
                                e.kondisi_fasilitas_rusak,
                                e.akreditasi
                           FROM detail_clustering d 
                           JOIN sekolah_bos s ON d.sekolah_id = s.id 
                           LEFT JOIN data_evaluasi_bos e ON (e.sekolah_id = d.sekolah_id AND e.tahun = :tahun)
                           WHERE d.riwayat_id = :riwayat_id";
            
            $stmtDetails = $this->db->prepare($sqlDetails);
            $stmtDetails->execute([
                ':riwayat_id' => $riwayat['id'],
                ':tahun' => $tahun // Correct binding for LEFT JOIN condition
            ]);
            $details = $stmtDetails->fetchAll();
            return ['riwayat' => $riwayat, 'details' => $details];
        }
        return null;
    }

    public function getLatestResult() {
        $stmt = $this->db->query("SELECT * FROM riwayat_clustering ORDER BY id DESC LIMIT 1");
        $riwayat = $stmt->fetch();
        
        if ($riwayat) {
            // Extract year from description to join with correct evaluation data
            $tahun = date('Y'); // Fallback
            if (preg_match('/Tahun\s+(\d{4})/', $riwayat['keterangan'], $matches)) {
                $tahun = $matches[1];
            }

            // Enhanced query to fetch feature data for visualization
            $sqlDetails = "SELECT 
                                d.*, 
                                s.nama_sekolah, 
                                s.npsn,
                                e.jumlah_siswa,
                                e.jumlah_guru,
                                e.jumlah_rombel,
                                e.dana_bos,
                                e.kondisi_fasilitas_rusak,
                                e.akreditasi
                           FROM detail_clustering d 
                           JOIN sekolah_bos s ON d.sekolah_id = s.id 
                           LEFT JOIN data_evaluasi_bos e ON (e.sekolah_id = d.sekolah_id AND e.tahun = :tahun)
                           WHERE d.riwayat_id = :riwayat_id";

            $stmtDetails = $this->db->prepare($sqlDetails);
            $stmtDetails->execute([
                ':riwayat_id' => $riwayat['id'],
                ':tahun' => $tahun
            ]);
            $details = $stmtDetails->fetchAll();
            return ['riwayat' => $riwayat, 'details' => $details];
        }
        return null;
    }
    public function getTrendStats() {
        // Fetch all history records ordered by date
        $stmt = $this->db->query("SELECT id, keterangan, tanggal_proses FROM riwayat_clustering ORDER BY tanggal_proses ASC");
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $trendData = [];

        foreach ($history as $record) {
            // Extract year from description
            $year = date('Y', strtotime($record['tanggal_proses'])); // Default to timestamp year
            if (preg_match('/Tahun\s+(\d{4})/', $record['keterangan'], $matches)) {
                $year = $matches[1];
            }

            // Count schools per cluster for this history record
            $sqlCount = "SELECT cluster_label, COUNT(*) as total 
                         FROM detail_clustering 
                         WHERE riwayat_id = :riwayat_id 
                         GROUP BY cluster_label";
            $stmtCount = $this->db->prepare($sqlCount);
            $stmtCount->execute([':riwayat_id' => $record['id']]);
            $counts = $stmtCount->fetchAll(PDO::FETCH_KEY_PAIR); // [label => total]

            // Normalize counts (ensure 0, 1, 2 exist)
            // Assuming 0=Low, 1=Medium, 2=High
            $trendData[] = [
                'year' => $year,
                'low' => isset($counts[0]) ? (int)$counts[0] : 0,
                'medium' => isset($counts[1]) ? (int)$counts[1] : 0,
                'high' => isset($counts[2]) ? (int)$counts[2] : 0
            ];
        }

        return $trendData;
    }
}
?>
