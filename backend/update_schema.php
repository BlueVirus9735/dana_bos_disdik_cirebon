<?php
require_once __DIR__ . '/app/config/database.php';

try {
    $db = Database::connect();
    echo "Connected to database.\n";

    // 1. Ensure `users` table exists
    $sqlUsers = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;";
    $db->exec($sqlUsers);
    echo "Table 'users' check/create passed.\n";

    // Helper function to add column if not exists
    function addColumnIfNotExists($db, $table, $column, $definition) {
        try {
            $check = $db->query("SHOW COLUMNS FROM $table LIKE '$column'");
            if ($check->rowCount() == 0) {
                $sql = "ALTER TABLE $table ADD COLUMN $column $definition";
                $db->exec($sql);
                echo "Added column '$column' to table '$table'.\n";
            } else {
                echo "Column '$column' already exists in '$table'.\n";
            }
        } catch (PDOException $e) {
            echo "Error checking/adding column '$column' in '$table': " . $e->getMessage() . "\n";
        }
    }

    // 2. Add columns to `sekolah_bos`
    // jenjang: SD, SMP, SMA
    addColumnIfNotExists($db, 'sekolah_bos', 'jenjang', "ENUM('SD', 'SMP', 'SMA') NOT NULL DEFAULT 'SD' AFTER nama_sekolah");

    // 3. Add columns to `users`
    // sekolah_id: reference to sekolah_bos
    addColumnIfNotExists($db, 'users', 'sekolah_id', "INT NULL AFTER role");
    addColumnIfNotExists($db, 'users', 'nama_lengkap', "VARCHAR(100) NULL AFTER sekolah_id");
    
    // Add Foreign Key for sekolah_id in users if possible, or just rely on logic. 
    // Let's create an index at least.
    try {
        // Check if index exists is valid query, or just try to add index and catch error?
        // Simplest way for foreign key in raw PHP migration without framework is try-catch
        $db->exec("ALTER TABLE users ADD CONSTRAINT fk_user_sekolah FOREIGN KEY (sekolah_id) REFERENCES sekolah_bos(id) ON DELETE SET NULL");
        echo "Added FK constraint 'fk_user_sekolah' to 'users'.\n";
    } catch (Exception $e) {
        // FK likely exists or fails
        echo "FK constraint might already exist or failed: " . $e->getMessage() . "\n";
    }

    // 4. Add columns to `data_evaluasi_bos`
    // status, catatan_revisi
    addColumnIfNotExists($db, 'data_evaluasi_bos', 'status', "ENUM('DRAFT', 'PENDING_VERIF', 'APPROVED', 'REJECTED') DEFAULT 'DRAFT' AFTER dana_bos");
    addColumnIfNotExists($db, 'data_evaluasi_bos', 'catatan_revisi', "TEXT NULL AFTER status");

    echo "Database schema update completed successfully.\n";

} catch (Exception $e) {
    echo "Critical Error: " . $e->getMessage() . "\n";
}
?>
