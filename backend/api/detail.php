<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../app/controllers/IjazahController.php';

$id = $_GET['id'] ?? 0;

$controller = new IjazahController();
$controller->getDetail($id);
