<?php
require_once __DIR__ . '/app/config/database.php';

try {
    $db = Database::connect();

    // Check if column exists
    $check = $db->query("SHOW COLUMNS FROM detail_clustering LIKE 'kategori_cluster'");
    
    if ($check->rowCount() == 0) {
        $sql = "ALTER TABLE detail_clustering ADD COLUMN kategori_cluster VARCHAR(50) AFTER cluster_label";
        $db->exec($sql);
        echo "Column 'kategori_cluster' added successfully.\n";
    } else {
        echo "Column 'kategori_cluster' already exists.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
