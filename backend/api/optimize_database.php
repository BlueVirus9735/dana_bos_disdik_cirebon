<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . '/../app/config/database.php';

try {
    $db = Database::connect();

    // 1. Upgrade dana_bos column to DECIMAL(20,2) to handle Trillions+
    // Max value: 999,999,999,999,999,999.99 (Quintillions)
    $sql = "ALTER TABLE data_evaluasi_bos MODIFY dana_bos DECIMAL(20,2) NOT NULL";
    $db->exec($sql);

    echo json_encode([
        "status" => "success",
        "message" => "Database berhasil dioptimalkan! Kapasitas Dana BOS ditingkatkan ke level maksimal (Quintillions)."
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Gagal mengoptimalkan database: " . $e->getMessage()
    ]);
}
?>
