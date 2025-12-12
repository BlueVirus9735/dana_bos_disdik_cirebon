<?php
require_once 'app/config/database.php';

try {
    $db = Database::connect();
    echo "Connected to database.\n";

    // 1. Get ID of SD Sukamaju data
    $stmt = $db->prepare("SELECT id FROM sekolah_bos WHERE nama_sekolah LIKE '%Sukamaju%' LIMIT 1");
    $stmt->execute();
    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        die("School SD Sukamaju not found. Please run seed_users.php first.\n");
    }
    $schoolId = $school['id'];
    echo "Found SD Sukamaju ID: $schoolId\n";

    // 2. Function to create user
    function createUser($db, $username, $password, $role, $sekolah_id, $nama_lengkap) {
        // Check exist
        $stmt = $db->prepare("SELECT id FROM users WHERE username = :username");
        $stmt->execute([':username' => $username]);
        if ($stmt->fetch()) {
            // Update role if exists
            $stmt = $db->prepare("UPDATE users SET role = :role, sekolah_id = :sekolah_id WHERE username = :username");
            $stmt->execute([':role' => $role, ':sekolah_id' => $sekolah_id, ':username' => $username]);
            echo "Updated User '$username' to role '$role'.\n";
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

    // 3. Create Operators
    createUser($db, 'op_bos', 'password123', 'operator_bos', $schoolId, 'Operator BOS SD Sukamaju');
    createUser($db, 'op_ijazah', 'password123', 'operator_ijazah', $schoolId, 'Operator Ijazah SD Sukamaju');

    echo "Done.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
