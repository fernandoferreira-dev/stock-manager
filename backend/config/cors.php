<?php
if (!class_exists('Dotenv\Dotenv')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

require_once __DIR__ . '/helpers.php';
$envOrigins = obterVariavelAmbiente('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000');
$allowedOrigins = array_map('trim', explode(',', $envOrigins));

return [
    'allowed_origins' => $allowedOrigins,
    'allowed_methods' => obterVariavelAmbiente('CORS_ALLOWED_METHODS', 'GET, POST, PUT, DELETE, OPTIONS'),
    'allowed_headers' => obterVariavelAmbiente('CORS_ALLOWED_HEADERS', 'Content-Type, Authorization, X-Requested-With'),
    'allow_credentials' => obterVariavelAmbiente('CORS_ALLOW_CREDENTIALS', 'true') === 'true',
    'max_age' => (int)obterVariavelAmbiente('CORS_MAX_AGE', '86400')
];
