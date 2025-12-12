<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

$conn = Database::getInstance()->getConnection();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $query = "SELECT 
                    prof.id_prof,
                    prof.id_pessoa,
                    pe.nome_pessoa,
                    prof.email_prof
                  FROM prof
                  INNER JOIN pessoa pe ON prof.id_pessoa = pe.id_pessoa
                  ORDER BY pe.nome_pessoa ASC";

        $stmt = $conn->prepare($query);
        $stmt->execute();

        $professores = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($professores);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
