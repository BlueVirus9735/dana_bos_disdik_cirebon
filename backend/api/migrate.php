<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . "/../app/config/database.php";

try {
    $db = Database::connect();
    
    // Create users table
    $sqlUsers = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($sqlUsers);
    
    // Create ijazah table
    $sqlIjazah = "CREATE TABLE IF NOT EXISTS ijazah (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        nisn VARCHAR(20) NOT NULL,
        tanggal_lahir DATE,
        nama_orang_tua VARCHAR(100),
        nomor_ijazah VARCHAR(50),
        sekolah VARCHAR(100),
        tahun YEAR,
        file_path VARCHAR(255),
        status_verifikasi TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($sqlIjazah);

    echo json_encode([
        "status" => true,
        "message" => "Database tables checked/created successfully."
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => false,
        "message" => "Database Error: " . $e->getMessage()
    ]);
}
