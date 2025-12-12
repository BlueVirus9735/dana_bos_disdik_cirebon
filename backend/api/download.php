<?php
/**
 * --------------------------------------------------------
 * DOWNLOAD FILE IJAZAH
 * --------------------------------------------------------
 * URL: backend/public/download.php?id=1
 * Akan mengambil file dari database, decode Base64 + XOR,
 * lalu mengirimkannya ke browser sebagai file download.
 * --------------------------------------------------------
 */

require_once __DIR__ . '/../app/config/database.php';
require_once __DIR__ . '/../app/controllers/IjazahController.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    die("ID tidak valid.");
}

$ctrl = new IjazahController($conn);
$res = $ctrl->download($id);

if (!$res || !isset($res['filename']) || !isset($res['filedata'])) {
    die("Data tidak ditemukan atau rusak.");
}

// File name asli
$filename = $res['filename'];

// Ambil data terenkripsi (Base64 string)
$encryptedData = $res['filedata'];

// -----------------------------
// DEKRIPSI FILE
// -----------------------------

// Decode Base64 -> hasil masih XOR
$xorData = base64_decode($encryptedData);

// Kunci XOR (HARUS sama dengan di upload)
$KEY = "ijazah_dinas_pendidikan";

// Proses XOR
$decrypted = "";
$keyLength = strlen($KEY);

for ($i = 0; $i < strlen($xorData); $i++) {
    $decrypted .= $xorData[$i] ^ $KEY[$i % $keyLength];
}

// -----------------------------
// KIRIM FILE KE USER
// -----------------------------

header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . strlen($decrypted));

echo $decrypted;
exit;
