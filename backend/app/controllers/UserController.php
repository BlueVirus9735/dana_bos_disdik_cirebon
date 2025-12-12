<?php

require_once __DIR__ . "/../models/UserModel.php";
require_once __DIR__ . "/../models/SekolahModel.php";
require_once __DIR__ . "/../helpers/response.php";

class UserController {
    
    private $userModel;

    public function __construct() {
        $this->userModel = new UserModel();
    }

    public function index() {
        $users = $this->userModel->getAll();
        jsonResponse(true, "Data user berhasil diambil", $users);
    }

    private function processSchoolInput($input) {
        if (!isset($input['new_school']) || $input['new_school'] !== true) {
            return $input['sekolah_id'] ?? null;
        }

        $namaSekolah = $input['nama_sekolah'] ?? '';
        $npsn = $input['npsn'] ?? '';
        $jenjang = $input['jenjang'] ?? '';

        if (!$namaSekolah || !$npsn || !$jenjang) {
             jsonResponse(false, "Nama Sekolah, NPSN, dan Jenjang wajib diisi untuk sekolah baru.");
        }
        
        $sekolahModel = new SekolahModel();
        $existingSchool = $sekolahModel->findByNPSN($npsn);
        
        if ($existingSchool) {
           // Update existing school details if found (in case name/jenjang changed)
           $sekolahModel->update($existingSchool['id'], [
               'nama_sekolah' => $namaSekolah,
               'alamat' => $input['alamat'] ?? $existingSchool['alamat'],
               'jenjang' => $jenjang
           ]);
           return $existingSchool['id'];
        } else {
            // Create new school
            if ($sekolahModel->create([
                'nama_sekolah' => $namaSekolah,
                'npsn'        => $npsn,
                'alamat'      => $input['alamat'] ?? '',
                'jenjang'     => $jenjang
            ])) {
                $createdSchool = $sekolahModel->findByNPSN($npsn);
                return $createdSchool['id'];
            } else {
                jsonResponse(false, "Gagal membuat data sekolah baru.");
            }
        }
    }

    public function store() {
        $input = json_decode(file_get_contents("php://input"), true);

        if (!isset($input['username']) || !isset($input['password'])) {
            jsonResponse(false, "Username dan Password wajib diisi");
        }

        $username = trim($input['username']);
        $password = $input['password'];
        $role = $input['role'] ?? 'user';
        
        // Handle School Input (New or Existing)
        $sekolahId = $this->processSchoolInput($input);

        if ($this->userModel->findByUsername($username)) {
            jsonResponse(false, "Username sudah digunakan");
        }

        $created = $this->userModel->create([
            'username' => $username,
            'password' => password_hash($password, PASSWORD_BCRYPT),
            'role' => $role,
            'sekolah_id' => $sekolahId
        ]);

        if ($created) {
            jsonResponse(true, "User berhasil ditambahkan");
        } else {
            jsonResponse(false, "Gagal menambahkan user");
        }
    }

    public function update($id) {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $data = [];
        if (isset($input['username'])) $data['username'] = trim($input['username']);
        if (isset($input['password']) && !empty($input['password'])) {
            $data['password'] = password_hash($input['password'], PASSWORD_BCRYPT);
        }
        if (isset($input['role'])) $data['role'] = $input['role'];
        
        // Handle School Input (New or Existing)
        // Check if we are updating school info
        if (isset($input['new_school']) || array_key_exists('sekolah_id', $input)) {
             $data['sekolah_id'] = $this->processSchoolInput($input);
        }

        if (empty($data)) {
            jsonResponse(false, "Tidak ada data yang diubah");
        }

        if ($this->userModel->update($id, $data)) {
            jsonResponse(true, "User berhasil diperbarui");
        } else {
            jsonResponse(false, "Gagal memperbarui user");
        }
    }

    public function destroy($id) {
        if ($this->userModel->delete($id)) {
            jsonResponse(true, "User berhasil dihapus");
        } else {
            jsonResponse(false, "Gagal menghapus user");
        }
    }
}
