<?php
if (!class_exists('Dotenv\Dotenv')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

require_once __DIR__ . '/helpers.php';

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        $host = obterVariavelAmbiente('DB_HOST', 'localhost');
        $port = obterVariavelAmbiente('DB_PORT', '3306');
        $dbname = obterVariavelAmbiente('DB_DATABASE', 'stock_manager');
        $username = obterVariavelAmbiente('DB_USERNAME', 'root');
        $password = obterVariavelAmbiente('DB_PASSWORD', '');

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";

        try {
            $this->pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            error_log("Falha na ligaÃ§Ã£o Ã  base de dados: " . $e->getMessage());
            throw new Exception("NÃ£o foi possÃ­vel conectar Ã  base de dados");
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }
}
