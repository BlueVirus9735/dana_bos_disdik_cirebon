<?php
require_once __DIR__ . '/app/config/database.php';

try {
    $db = Database::connect();
    echo "Connected to database for seeding.\n";

    // --- 1. Seed Schools (SD, SMP, SMA) ---
    function seedSchool($db, $nama, $npsn, $jenjang, $alamat) {
        // Check if exists
        $stmt = $db->prepare("SELECT id FROM sekolah_bos WHERE npsn = :npsn");
        $stmt->execute([':npsn' => $npsn]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            echo "School '$nama' ($jenjang) already exists. ID: " . $existing['id'] . "\n";
            return $existing['id'];
        }

        $stmt = $db->prepare("INSERT INTO sekolah_bos (nama_sekolah, npsn, jenjang, alamat) VALUES (:nama, :npsn, :jenjang, :alamat)");
        $stmt->execute([
            ':nama' => $nama,
            ':npsn' => $npsn,
            ':jenjang' => $jenjang,
            ':alamat' => $alamat
        ]);
        $id = $db->lastInsertId();
        echo "Created School '$nama' ($jenjang). ID: $id\n";
        return $id;
    }

    $id_sd_sukamaju = seedSchool($db, 'SD Sukamaju 01', '10101010', 'SD', 'Jl. Merdeka No. 1');
    $id_smp_bangsa  = seedSchool($db, 'SMP Nusa Bangsa', '20202020', 'SMP', 'Jl. Jendral Sudirman No. 5');
    $id_sma_garuda  = seedSchool($db, 'SMA Garuda Indonesia', '30303030', 'SMA', 'Jl. Pahlawan No. 10');


    // --- 2. Seed Users ---
    function seedUser($db, $username, $password, $role, $sekolah_id = null, $nama_lengkap = null) {
        $stmt = $db->prepare("SELECT id FROM users WHERE username = :username");
        $stmt->execute([':username' => $username]);
        if ($stmt->fetch()) {
            echo "User '$username' already exists. Skipping.\n";
            // Optional: Update role/sekolah_id if needed, but for now skip.
            return;
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        
        $stmt = $db->prepare("INSERT INTO users (username, password, role, sekolah_id, nama_lengkap) VALUES (:username, :password, :role, :sekolah_id, :nama_lengkap)");
        $stmt->execute([
            ':username' => $username,
            ':password' => $hashed,
            ':role' => $role,
            ':sekolah_id' => $sekolah_id,
            ':nama_lengkap' => $nama_lengkap
        ]);
        echo "Created User '$username' with role '$role'.\n";
    }

    echo "Seeding users...\n";

    // Super Admin & Admins (No School)
    seedUser($db, 'super_admin', 'password123', 'super_admin', null, 'Super Administrator');
    seedUser($db, 'admin_bos', 'password123', 'admin_bos', null, 'Pengelola Dana BOS');
    seedUser($db, 'admin_ijazah', 'password123', 'admin_ijazah', null, 'Pengelola Arsip Ijazah');

    // School Operators (Linked to School IDs)
    seedUser($db, 'op_sd', 'password123', 'operator_sekolah', $id_sd_sukamaju, 'Operator SD Sukamaju');
    seedUser($db, 'op_smp', 'password123', 'operator_sekolah', $id_smp_bangsa, 'Operator SMP Nusa Bangsa');
    seedUser($db, 'op_sma', 'password123', 'operator_sekolah', $id_sma_garuda, 'Operator SMA Garuda');
    
    // Legacy user update (if needed, e.g., 'user' -> 'operator_sekolah' linked to SD)
    // seedUser($db, 'user', 'password123', 'operator_sekolah', $id_sd_sukamaju, 'Operator Legacy'); 

    echo "Seeding completed successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
