<?php
require_once __DIR__ . '/../index.php';
require_once __DIR__ . '/../models/Users.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['message' => 'MÃ©todo nÃ£o permitido']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $email = trim(strtolower($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(422);
        echo json_encode(['message' => 'Email e password sÃ£o obrigatÃ³rios']);
        exit;
    }

    $userModel = new User();
    $userData = $userModel->login($email, $password);

    if (!$userData) {
        http_response_code(401);
        echo json_encode(['message' => 'Email ou password incorretos']);
        exit;
    }

    $role = $userModel->obterTipo($userData['id_pessoa']);

    $payload = [
        'id' => $userData['id_pessoa'],
        'nome' => $userData['nome_pessoa'],
        'role' => $role
    ];

    $token = JWT::encode($payload);

    echo json_encode([
        'token' => $token,
        'user' => $userData,
        'role' => $role,
        'redirect' => ($role === 'administrador') ? '/admin/dashboard' : '/user/dashboard'
    ], JSON_UNESCAPED_SLASHES);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => $e->getMessage()]);
    exit;
}

