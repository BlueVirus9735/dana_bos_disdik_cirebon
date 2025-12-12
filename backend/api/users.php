<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../app/controllers/UserController.php';

$controller = new UserController();
$method = $_SERVER['REQUEST_METHOD'];

// Parse ID from URL if exists (e.g., /users.php?id=1)
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        $controller->index();
        break;
    case 'POST':
        $controller->store();
        break;
    case 'PUT':
        if ($id) {
            $controller->update($id);
        } else {
            http_response_code(400);
            echo json_encode(["status" => false, "message" => "ID diperlukan untuk update"]);
        }
        break;
    case 'DELETE':
        if ($id) {
            $controller->destroy($id);
        } else {
            http_response_code(400);
            echo json_encode(["status" => false, "message" => "ID diperlukan untuk hapus"]);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(["status" => false, "message" => "Metode tidak diizinkan"]);
        break;
}
