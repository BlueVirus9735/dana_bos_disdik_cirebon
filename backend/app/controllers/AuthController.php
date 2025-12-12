<?php

require_once __DIR__ . "/../models/UserModel.php";
require_once __DIR__ . "/../helpers/response.php";

class AuthController {

    public function login() {
        $input = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($input['username']) || !isset($input['password'])) {
            jsonResponse(false, "Username dan Password wajib diisi");
        }

        $username = $input['username'];
        $password = $input['password'];

        $userModel = new UserModel();
        $user = $userModel->findByUsername($username);

        if ($user) {
            if (password_verify($password, $user['password'])) {
                 unset($user['password']); 
                 jsonResponse(true, "Login berhasil", [
                     'token' => base64_encode($user['username'] . ':' . time()), 
                     'user' => $user
                 ]);
            } else {
                 jsonResponse(false, "Password salah");
            }
        } else {
            jsonResponse(false, "User tidak ditemukan");
        }
    }

    public function register() {
        $input = json_decode(file_get_contents("php://input"), true);

        if (!isset($input['username']) || !isset($input['password'])) {
            jsonResponse(false, "Username dan Password wajib diisi");
        }

        $username = trim($input['username']);
        $password = $input['password'];

        if (strlen($username) < 3) {
            jsonResponse(false, "Username minimal 3 karakter");
        }
        if (strlen($password) < 6) {
            jsonResponse(false, "Password minimal 6 karakter");
        }

        $userModel = new UserModel();

        if ($userModel->findByUsername($username)) {
            jsonResponse(false, "Username sudah digunakan");
        }
        $created = $userModel->create([
            'username' => $username,
            'password' => password_hash($password, PASSWORD_BCRYPT), // Secure hash
            'role' => 'user'
        ]);

        if ($created) {
            jsonResponse(true, "Registrasi berhasil! Silakan login.");
        } else {
            jsonResponse(false, "Gagal membuat akun.");
        }
    }
}