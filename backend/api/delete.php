<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once "../app/config/database.php";
require_once "../app/helpers/response.php";

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id'])) {
    jsonResponse(false, "ID tidak ditemukan dalam request");
}

$id = $conn->real_escape_string($input['id']);

// Ambil file_path dulu sebelum delete dari database
$get = $conn->query("SELECT file_path FROM ijazah WHERE id='$id' LIMIT 1");

if ($get->num_rows === 0) {
    jsonResponse(false, "Data tidak ditemukan");
}

$file = $get->fetch_assoc()['file_path'];
$filePath = "../uploads/" . $file;

// Hapus dari database
$conn->query("DELETE FROM ijazah WHERE id='$id'");

// Hapus file jika ada
if (file_exists($filePath)) {
    unlink($filePath);
}

jsonResponse(true, "Data berhasil dihapus", ["deleted_file" => $file]);
