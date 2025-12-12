<?php

require_once __DIR__ . "/../config/database.php";

class UserModel {

    private $db;
    
    public function __construct() {
        $this->db = Database::connect();
    }

    public function findByUsername($username) {
        $stmt = $this->db->prepare("
            SELECT u.id, u.username, u.password, u.role, u.sekolah_id, u.nama_lengkap, 
                   s.jenjang, s.nama_sekolah, s.npsn 
            FROM users u
            LEFT JOIN sekolah_bos s ON u.sekolah_id = s.id
            WHERE u.username = :username 
            LIMIT 1
        ");
        $stmt->execute([':username' => $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {       
        $role = $data['role'] ?? 'user';
        
        $stmt = $this->db->prepare("INSERT INTO users (username, password, role, sekolah_id) VALUES (:username, :password, :role, :sekolah_id)");
        return $stmt->execute([
            ':username' => $data['username'],
            ':password' => $data['password'],
            ':role' => $role,
            ':sekolah_id' => $data['sekolah_id'] ?? null
        ]);
    }

    public function getAll() {
        $stmt = $this->db->prepare("
            SELECT u.id, u.username, u.role, u.sekolah_id, 
                   s.nama_sekolah, s.npsn, s.jenjang 
            FROM users u
            LEFT JOIN sekolah_bos s ON u.sekolah_id = s.id
            ORDER BY u.id DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];

        if (!empty($data['username'])) {
            $fields[] = "username = :username";
            $params[':username'] = $data['username'];
        }
        if (!empty($data['password'])) {
            $fields[] = "password = :password";
            $params[':password'] = $data['password'];
        }
        if (!empty($data['role'])) {
            $fields[] = "role = :role";
            $params[':role'] = $data['role'];
        }
        if (array_key_exists('sekolah_id', $data)) {
            $fields[] = "sekolah_id = :sekolah_id";
            $params[':sekolah_id'] = $data['sekolah_id'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}