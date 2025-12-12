<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../models/CartaoRFID.php';

$cartaoRFID = new CartaoRFID();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if (isset($_GET['stats'])) {
                $stats = $cartaoRFID->obterEstatisticas();
                echo json_encode($stats ?: ["message" => "Sem dados"]);
                exit;
            }
            if (isset($_GET['uid'])) {
                $cartao = $cartaoRFID->obterPorUID($_GET['uid']);
                if ($cartao) {
                    echo json_encode($cartao);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "CartÃ£o nÃ£o encontrado"]);
                }
                exit;
            }
            if (isset($_GET['artigo'])) {
                $cartoes = $cartaoRFID->listarPorArtigo($_GET['artigo']);
                echo json_encode($cartoes);
                exit;
            }
            $cartoes = $cartaoRFID->listarTodos();
            echo json_encode($cartoes);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['uid']) || empty($input['uid'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "UID Ã© obrigatÃ³rio"]);
                exit;
            }

            $uid = $input['uid'];
            $id_artigo = $input['id_artigo'] ?? null;
            $ativo = isset($input['ativo']) ? (int)$input['ativo'] : 1;

            $resultado = $cartaoRFID->registrar($uid, $id_artigo, $ativo);

            if ($resultado['success']) {
                http_response_code(201);
            } else {
                http_response_code(400);
            }

            echo json_encode($resultado);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['uid']) || empty($input['uid'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "UID Ã© obrigatÃ³rio"]);
                exit;
            }

            $uid = $input['uid'];
            if (isset($input['desassociar']) && $input['desassociar'] === true) {
                $resultado = $cartaoRFID->desassociar($uid);
                echo json_encode($resultado);
                exit;
            }
            if (isset($input['ativo'])) {
                $resultado = $cartaoRFID->atualizarStatus($uid, (int)$input['ativo']);
                echo json_encode($resultado);
                exit;
            }
            if (isset($input['id_artigo'])) {
                $resultado = $cartaoRFID->associar($uid, $input['id_artigo']);
                echo json_encode($resultado);
                exit;
            }

            http_response_code(400);
            echo json_encode(["success" => false, "message" => "AÃ§Ã£o nÃ£o especificada"]);
            break;

        case 'DELETE':
            if (!isset($_GET['uid'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "UID nÃ£o fornecido"]);
                exit;
            }

            $resultado = $cartaoRFID->eliminar($_GET['uid']);

            if ($resultado['success']) {
                http_response_code(200);
            } else {
                http_response_code(500);
            }

            echo json_encode($resultado);
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "MÃ©todo nÃ£o permitido"]);
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erro no servidor",
        "error" => $e->getMessage()
    ]);
}
?>

