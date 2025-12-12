<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();
try {
    $conn = new PDO(
        $_ENV['DB_CONNECTION'] . 
        ":host=" . $_ENV['DB_HOST'] . 
        ";dbname=" . $_ENV['DB_DATABASE'] . 
        ";charset=" . $_ENV['DB_CHARSET'],
        $_ENV['DB_USERNAME'],
        $_ENV['DB_PASSWORD']
    );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

