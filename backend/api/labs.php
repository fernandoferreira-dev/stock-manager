<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../models/Lab.php';

$lab = new Lab();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $data = $lab->obterPorId($_GET['id']);
                echo json_encode($data ?: ["message" => "LaboratÃ³rio nÃ£o encontrado"]);
            } elseif (isset($_GET['artigos'])) {
                $data = $lab->obterArtigos($_GET['artigos']);
                echo json_encode($data);
            } else {
                $data = $lab->listarTodos();
                echo json_encode($data);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'));

            if (!isset($input->num_lab)) {
                http_response_code(400);
                echo json_encode(["message" => "NÃºmero do laboratÃ³rio Ã© obrigatÃ³rio"]);
                break;
            }

            $lab->num_lab = $input->num_lab;

            $id = $lab->criar();
            if ($id) {
                http_response_code(201);
                echo json_encode([
                    "message" => "LaboratÃ³rio criado com sucesso",
                    "id" => $id
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Erro ao criar laboratÃ³rio"]);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'));

            if (!isset($input->id_lab) || !isset($input->num_lab)) {
                http_response_code(400);
                echo json_encode(["message" => "Dados incompletos"]);
                break;
            }

            $lab->id_lab = $input->id_lab;
            $lab->num_lab = $input->num_lab;

            if ($lab->atualizar()) {
                echo json_encode(["message" => "LaboratÃ³rio atualizado com sucesso"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Erro ao atualizar laboratÃ³rio"]);
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(["message" => "ID nÃ£o fornecido"]);
                break;
            }
            $totalArtigos = $lab->contarArtigos($_GET['id']);
            if ($totalArtigos > 0) {
                http_response_code(400);
                echo json_encode([
                    "message" => "NÃ£o Ã© possÃ­vel eliminar. LaboratÃ³rio tem {$totalArtigos} artigo(s) associado(s)"
                ]);
                break;
            }

            if ($lab->eliminar($_GET['id'])) {
                echo json_encode(["message" => "LaboratÃ³rio eliminado com sucesso"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Erro ao eliminar laboratÃ³rio"]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "MÃ©todo nÃ£o permitido"]);
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Erro no servidor",
        "error" => $e->getMessage()
    ]);
}
?>
