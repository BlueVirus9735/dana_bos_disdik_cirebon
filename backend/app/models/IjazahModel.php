<?php

require_once __DIR__ . "/../config/database.php";

class IjazahModel {

    private $db;
    
    public function __construct() {
        $this->db = Database::connect();
    }

    public function save($data) {
        
        $sql = "INSERT INTO ijazah 
        (nama, nisn, tanggal_lahir, nama_orang_tua, nomor_ijazah, sekolah, tahun, file_path, created_at) 
        VALUES (:nama, :nisn, :tanggal_lahir, :nama_orang_tua, :nomor_ijazah, :sekolah, :tahun, :file_path, NOW())";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ":nama"              => $data["nama"],
            ":nisn"              => $data["nisn"],
            ":tanggal_lahir"     => $data["tanggal_lahir"],
            ":nama_orang_tua"    => $data["nama_orang_tua"],
            ":nomor_ijazah"      => $data["nomor_ijazah"],
            ":sekolah"           => $data["sekolah"],
            ":tahun"             => $data["tahun"],
            ":file_path"         => $data["file_path"]
        ]);
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM ijazah WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function countAll() {
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM ijazah");
        return $stmt->fetchColumn();
    }

    public function getRecent($limit = 5) {
        $stmt = $this->db->prepare("SELECT * FROM ijazah ORDER BY created_at DESC LIMIT :limit");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getYearDistribution() {
        $stmt = $this->db->query("SELECT tahun, COUNT(*) as count FROM ijazah GROUP BY tahun ORDER BY tahun ASC");
        return $stmt->fetchAll();
    }
}
