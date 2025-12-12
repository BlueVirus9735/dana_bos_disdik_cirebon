<?php
require_once __DIR__ . "/../config/database.php";

class EvaluasiBosModel {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function getAll($sekolah_id = null) {
        $sql = "SELECT d.*, s.nama_sekolah, s.npsn 
                FROM data_evaluasi_bos d 
                JOIN sekolah_bos s ON d.sekolah_id = s.id";
        
        if ($sekolah_id) {
            $sql .= " WHERE d.sekolah_id = :sekolah_id";
        }
        
        $sql .= " ORDER BY s.nama_sekolah ASC";
        
        $stmt = $this->db->prepare($sql);
        
        if ($sekolah_id) {
            $stmt->execute([':sekolah_id' => $sekolah_id]);
        } else {
            $stmt->execute();
        }
        
        return $stmt->fetchAll();
    }

    public function save($data) {
        $status = $data['status'] ?? 'DRAFT'; // Default to DRAFT
        $file_path = $data['file_bukti_path'] ?? null;

        $sql = "INSERT INTO data_evaluasi_bos 
                (sekolah_id, tahun, jumlah_siswa, jumlah_guru, jumlah_rombel, dana_bos, kondisi_fasilitas_rusak, akreditasi, status, file_bukti_path) 
                VALUES (:sekolah_id, :tahun, :jumlah_siswa, :jumlah_guru, :jumlah_rombel, :dana_bos, :kondisi_fasilitas_rusak, :akreditasi, :status, :file_bukti_path)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':sekolah_id' => $data['sekolah_id'],
            ':tahun' => $data['tahun'],
            ':jumlah_siswa' => $data['jumlah_siswa'],
            ':jumlah_guru' => $data['jumlah_guru'],
            ':jumlah_rombel' => $data['jumlah_rombel'],
            ':dana_bos' => $data['dana_bos'],
            ':kondisi_fasilitas_rusak' => $data['kondisi_fasilitas_rusak'],
            ':akreditasi' => $data['akreditasi'],
            ':status' => $status,
            ':file_bukti_path' => $file_path
        ]);
    }

    public function update($id, $data) {
        $fields = [
            'jumlah_siswa' => $data['jumlah_siswa'],
            'jumlah_guru' => $data['jumlah_guru'],
            'jumlah_rombel' => $data['jumlah_rombel'],
            'dana_bos' => $data['dana_bos'],
            'kondisi_fasilitas_rusak' => $data['kondisi_fasilitas_rusak'],
            'akreditasi' => $data['akreditasi']
        ];

        // Conditional update for status if provided
        if (isset($data['status'])) {
            $fields['status'] = $data['status'];
        }

        // Conditional update for file path if provided
        if (isset($data['file_bukti_path'])) {
            $fields['file_bukti_path'] = $data['file_bukti_path'];
        }

        $setClause = [];
        foreach ($fields as $key => $value) {
            $setClause[] = "$key = :$key";
        }
        $sql = "UPDATE data_evaluasi_bos SET " . implode(", ", $setClause) . " WHERE id = :id";
        
        $params = $fields;
        $params['id'] = $id;

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function updateStatus($id, $status, $catatan = null) {
        $sql = "UPDATE data_evaluasi_bos SET status = :status, catatan_revisi = :catatan WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':status' => $status,
            ':catatan' => $catatan
        ]);
    }
    
    // For clustering, we need numeric data only (normalized usually, but let's grab raw first)
    public function getDataForClustering($tahun) {
        $sql = "SELECT id, jumlah_siswa, jumlah_guru, jumlah_rombel, dana_bos, kondisi_fasilitas_rusak 
                FROM data_evaluasi_bos WHERE tahun = :tahun AND status = 'APPROVED'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tahun' => $tahun]);
        return $stmt->fetchAll();
    }

    public function getTotalSiswa() {
        // Assume latest year for validation
        $sql = "SELECT SUM(jumlah_siswa) as total FROM data_evaluasi_bos WHERE tahun = (SELECT MAX(tahun) FROM data_evaluasi_bos)";
        $stmt = $this->db->query($sql);
        return $stmt->fetchColumn() ?: 0;
    }

    public function getTotalDanaBos() {
        $sql = "SELECT SUM(dana_bos) as total FROM data_evaluasi_bos WHERE tahun = (SELECT MAX(tahun) FROM data_evaluasi_bos)";
        $stmt = $this->db->query($sql);
        return $stmt->fetchColumn() ?: 0;
    }

    public function countSekolah() {
        $sql = "SELECT COUNT(DISTINCT sekolah_id) as total FROM data_evaluasi_bos";
        $stmt = $this->db->query($sql);
        return $stmt->fetchColumn() ?: 0;
    }

    public function getAkreditasiDistribution() {
        $sql = "SELECT akreditasi, COUNT(*) as count FROM data_evaluasi_bos GROUP BY akreditasi";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }
}
?>
