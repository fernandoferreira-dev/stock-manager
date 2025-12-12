<?php
if (!function_exists('obterVariavelAmbiente')) {

    function obterVariavelAmbiente(string $key, $default = null) {

        if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
            return $_ENV[$key];
        }
        if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
            return $_SERVER[$key];
        }
        $envValue = getenv($key);
        if ($envValue !== false) {
            return $envValue;
        }
        return $default;
    }
}

if (!function_exists('applyCorsHeaders')) {

    function applyCorsHeaders() {
        $corsConfig = require __DIR__ . '/cors.php';
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if ($origin && in_array($origin, $corsConfig['allowed_origins'])) {
            header("Access-Control-Allow-Origin: $origin");
            $originIsWildcard = false;
        } else {

            header('Access-Control-Allow-Origin: *');
            $originIsWildcard = true;
        }

        $defaultHeaders = 'Content-Type, Authorization, X-Requested-With, Accept';
        $allowedHeaders = trim($corsConfig['allowed_headers']);
        if ($allowedHeaders === '') {
            $allowedHeaders = $defaultHeaders;
        } else {
            $allowedHeaders = $defaultHeaders . ', ' . $allowedHeaders;
        }

        header("Access-Control-Allow-Methods: {$corsConfig['allowed_methods']}");
        header("Access-Control-Allow-Headers: $allowedHeaders");

        if (!empty($corsConfig['allow_credentials']) && !$originIsWildcard) {
            header('Access-Control-Allow-Credentials: true');
        }

        header("Access-Control-Max-Age: {$corsConfig['max_age']}");
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
if (!function_exists('responderJSON')) {
    function responderJSON($data, int $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}
