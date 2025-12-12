<?php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/helpers.php';

function verificarJWT() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    if (empty($headers) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!isset($headers['Authorization']) && !isset($headers['authorization'])) {
        responderJSON(['erro' => 'Token nÃ£o fornecido'], 401);
    }
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token = preg_replace('/^Bearer\s+/i', '', $authHeader);
    if (empty($token)) {
        responderJSON(['erro' => 'Token invÃ¡lido'], 401);
    }

    try {
        $payload = JWT::decode($token);
        return $payload;
    } catch (Exception $e) {
        responderJSON(['erro' => $e->getMessage()], 401);
    }
}
