<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once __DIR__ . '/../app/models/SekolahModel.php';

$model = new SekolahModel();
$schools = $model->getAll();

echo json_encode([
    "status" => true,
    "data" => $schools
]);
?>
