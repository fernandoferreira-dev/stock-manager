<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
require_once __DIR__ . '/config/helpers.php';
applyCorsHeaders();
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
