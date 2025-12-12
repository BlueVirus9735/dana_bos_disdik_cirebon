<?php

require_once __DIR__ . "/../models/IjazahModel.php";
require_once __DIR__ . "/../helpers/response.php";

class IjazahController {

    public function upload() {
        if (!isset($_FILES["file"])) {
            jsonResponse(false, "File belum dipilih");
        }

        $nama             = $_POST["nama"];
        $nisn             = $_POST["nisn"];
        $tanggal_lahir    = $_POST["tanggal_lahir"];
        $nama_orang_tua   = $_POST["nama_orang_tua"];
        $tahun            = $_POST["tahun"];
        $nomor_ijazah     = $_POST["nomor_ijazah"] ?? "IJZ-" . rand(100000, 999999);
        $sekolah          = $_POST["sekolah"];

        if(!$nama || !$nisn || !$tanggal_lahir || !$nama_orang_tua || !$tahun) {
            jsonResponse(false, "Semua field wajib diisi.");
        }

        $file = $_FILES["file"];
        $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

        if (!in_array($ext, ["pdf", "jpg", "jpeg", "png"])) {
            jsonResponse(false, "Format file tidak didukung (hanya PDF/JPG/PNG).");
        }

        $uploadDir = __DIR__ . "/../../uploads/";
        if (!is_dir($uploadDir)) {
             mkdir($uploadDir, 0777, true);
        }

        // Sanitize original filename to remove special characters
        $originalName = pathinfo($file["name"], PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9\-_]/', '', $originalName);
        $filename = uniqid() . "_" . $safeName . "." . $ext;
        $targetFile = $uploadDir . $filename;

        
        $KEY = "ijazah_dinas_pendidikan";
        $fileContent = file_get_contents($file["tmp_name"]);
        
        // Encrypt: XOR + Base64
        $encrypted = "";
        $keyLength = strlen($KEY);
        for ($i = 0; $i < strlen($fileContent); $i++) {
            $encrypted .= $fileContent[$i] ^ $KEY[$i % $keyLength];
        }
        $finalData = base64_encode($encrypted);

        
        if (file_put_contents($targetFile, $finalData) === false) {
             jsonResponse(false, "Gagal menyimpan file enkripsi.");
        }

        $model = new IjazahModel();
        try {
            $save = $model->save([
                "nama"              => $nama,
                "nisn"              => $nisn,
                "tanggal_lahir"     => $tanggal_lahir,
                "nama_orang_tua"    => $nama_orang_tua,
                "nomor_ijazah"      => $nomor_ijazah,
                "sekolah"           => $sekolah,
                "tahun"             => $tahun,
                "file_path"         => $filename
            ]);
            
            if ($save) {
                jsonResponse(true, "Ijazah berhasil diupload!", ["file" => $filename]);
            } else {
                jsonResponse(false, "Gagal menyimpan ke database.");
            }
        } catch (Exception $e) {
            jsonResponse(false, "Error: " . $e->getMessage());
        }
    }

    public function download($id) {
        $model = new IjazahModel();
        $data = $model->findById($id);

        if (!$data) {
            return null;
        }

        $filePath = __DIR__ . "/../../uploads/" . $data['file_path'];
        
        if (!file_exists($filePath)) {
            return null;
        }

        $fileContent = file_get_contents($filePath);
        return [
            'filename' => $data['file_path'],
            'filedata' => $fileContent
        ];
    }
    
    public function getDetail($id) {
        $model = new IjazahModel();
        $data = $model->findById($id);
        if ($data) {
            jsonResponse(true, "Detail Ijazah", $data);
        } else {
            jsonResponse(false, "Data tidak ditemukan");
        }
    }
}
