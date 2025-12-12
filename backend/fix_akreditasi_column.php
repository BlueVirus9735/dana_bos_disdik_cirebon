<?php
require_once __DIR__ . '/app/config/database.php';

try {
    $db = Database::connect();

    // Fix for "Data truncated for column 'akreditasi'"
    // Change ENUM to VARCHAR to be safe and allow longer strings
    $sql = "ALTER TABLE data_evaluasi_bos MODIFY akreditasi VARCHAR(50) DEFAULT 'Tidak Terakreditasi';";
    
    $db->exec($sql);
    echo "Successfully altered table 'data_evaluasi_bos', column 'akreditasi' to VARCHAR(50).\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
