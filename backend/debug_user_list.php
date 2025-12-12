<?php
require_once 'app/config/database.php';
$db = Database::connect();
$stmt = $db->query("SELECT id, username, role FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($users);
?>
