<?php
require_once 'app/config/database.php';
$db = Database::connect();
$stmt = $db->query("SELECT id, username, role FROM users WHERE username IN ('op_bos', 'admin_bos')");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($users);
?>
