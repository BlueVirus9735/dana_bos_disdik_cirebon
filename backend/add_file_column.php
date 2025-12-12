<?php
require_once __DIR__ . '/app/config/Database.php';

try {
    $db = Database::connect();
    
    // Check if column exists
    $check = $db->query("SHOW COLUMNS FROM data_evaluasi_bos LIKE 'file_bukti_path'");
    
    if ($check->rowCount() == 0) {
        $db->exec("ALTER TABLE data_evaluasi_bos ADD COLUMN file_bukti_path VARCHAR(255) NULL AFTER status");
        echo "Column 'file_bukti_path' added successfully.\n";
    } else {
        echo "Column 'file_bukti_path' already exists.\n";
    }
    
    // Ensure upload directory exists
    $uploadDir = __DIR__ . '/uploads/bukti_bos';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
        echo "Upload directory created at $uploadDir\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
