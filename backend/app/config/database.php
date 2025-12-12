<?php

$DB_CONFIG = [
    'host' => 'localhost',
    'username' => 'root',
    'password' => '',
    'database' => 'dinas_pendidikan_db',
    'charset' => 'utf8mb4',
];
try {
    $conn = new mysqli(
        $DB_CONFIG['host'],
        $DB_CONFIG['username'],
        $DB_CONFIG['password'],
        $DB_CONFIG['database']
    );

    if ($conn->connect_error) {
        throw new Exception("Koneksi database gagal: " . $conn->connect_error);
    }
    $conn->set_charset($DB_CONFIG['charset']);

} catch (Exception $e) {
    die("<h4 style='color:red;'>Database Error (MySQLi):</h4><pre>" . $e->getMessage() . "</pre>");
}
class Database {
    private static $instance = null;

    public static function connect() {
        global $DB_CONFIG;
        if (self::$instance === null) {
            try {
                $dsn = "mysql:host=" . $DB_CONFIG['host'] . ";dbname=" . $DB_CONFIG['database'] . ";charset=" . $DB_CONFIG['charset'];
                self::$instance = new PDO($dsn, $DB_CONFIG['username'], $DB_CONFIG['password']);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                die("Database Error (PDO): " . $e->getMessage());
            }
        }
        return self::$instance;
    }
}
?>