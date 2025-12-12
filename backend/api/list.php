<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "../app/config/database.php";

$response = [
    "status" => false,
    "message" => "",
    "data" => []
];

try {

    $sekolah = isset($_GET['sekolah']) ? $_GET['sekolah'] : null;
    $jenjang = isset($_GET['jenjang']) ? $_GET['jenjang'] : null;
    $tahun   = isset($_GET['tahun']) ? $_GET['tahun'] : null;

    $sql = "SELECT i.* FROM ijazah i 
            LEFT JOIN sekolah_bos s ON i.sekolah = s.nama_sekolah 
            WHERE 1=1";
    
    $types = "";
    $params = [];

    if ($sekolah) {
        $sql .= " AND i.sekolah LIKE ?";
        $types .= "s";
        $params[] = "%" . $sekolah . "%";
    }

    if ($jenjang) {
        $sql .= " AND s.jenjang = ?";
        $types .= "s";
        $params[] = $jenjang;
    }

    if ($tahun) {
        $sql .= " AND i.tahun = ?";
        $types .= "s"; // Tahun is likely stored as string or int, s works for both in bind_param usually, or use i if int.
        $params[] = $tahun;
    }

    $sql .= " ORDER BY i.id DESC";

    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result) {
        throw new Exception("Query gagal dijalankan: " . $conn->error);
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    $response["status"] = true;
    $response["message"] = "Data berhasil ditemukan";
    $response["data"] = $data;

} catch (Exception $e) {
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
exit;
