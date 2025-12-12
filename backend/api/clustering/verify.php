<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../app/config/Database.php';
require_once '../../app/controllers/ClusteringController.php';

$controller = new ClusteringController();
$controller->verify();
?>
