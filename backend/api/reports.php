<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';
require_once '../models/Reports.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $db = Database::getInstance()->getConnection();
    $report = new Report($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = $_SERVER['REQUEST_URI'];
    $id = $_SERVER['REDIRECT_ID'] ?? null;
    if (!$id) {
        preg_match('/\/reports[\.php]*\/(\d+)/', $uri, $matches);
        $id = $matches[1] ?? null;
    }

    switch ($method) {
        case 'GET':
            if ($id) {
                $data = $report->getById($id);
                if ($data) {
                    echo json_encode($data);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Report nÃ£o encontrado']);
                }
            } else {
                $data = $report->getAll();
                echo json_encode($data);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            $errors = $report->validate($input);
            if (!empty($errors)) {
                http_response_code(400);
                echo json_encode(['errors' => $errors]);
                break;
            }

            $newId = $report->create($input);
            http_response_code(201);
            echo json_encode([
                'message' => 'Report criado com sucesso',
                'id_report' => $newId
            ]);
            break;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID Ã© obrigatÃ³rio']);
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            $errors = $report->validate($input, true);
            if (!empty($errors)) {
                http_response_code(400);
                echo json_encode(['errors' => $errors]);
                break;
            }

            if ($report->update($id, $input)) {
                echo json_encode(['message' => 'Report atualizado com sucesso']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Report nÃ£o encontrado']);
            }
            break;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID Ã© obrigatÃ³rio']);
                break;
            }

            if ($report->delete($id)) {
                echo json_encode(['message' => 'Report eliminado com sucesso']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Report nÃ£o encontrado']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'MÃ©todo nÃ£o permitido']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro na base de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
