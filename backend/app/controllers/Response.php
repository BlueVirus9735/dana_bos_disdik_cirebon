<?php

class Response {
    public static function success($message, $data = []) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => $message,
            "data" => $data
        ]);
        exit;
    }

    public static function error($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            "status" => "error",
            "message" => $message
        ]);
        exit;
    }
}
