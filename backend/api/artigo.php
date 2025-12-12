<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../models/Artigo.php';

$artigo = new Artigo();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'OPTIONS':
            http_response_code(200);
            echo json_encode(["message" => "OK"]);
            break;
        case 'GET':
            if (isset($_GET['id'])) {
                $data = $artigo->obterPorId($_GET['id']);
                echo json_encode($data ?: ["message" => "Artigo nÃ£o encontrado"]);
            } elseif (isset($_GET['lab'])) {
                $data = $artigo->listarPorLab($_GET['lab']);
                echo json_encode($data);
            } elseif (isset($_GET['categoria'])) {
                $data = $artigo->listarPorCategoria($_GET['categoria']);
                echo json_encode($data);
            } elseif (isset($_GET['pesquisa'])) {
                $data = $artigo->pesquisar($_GET['pesquisa']);
                echo json_encode($data);
            } else {
                $data = $artigo->listarTodos();
                echo json_encode($data);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'));
            $artigo->nome_artigo = $input->nome_artigo;
            $artigo->num_serial = $input->num_serial ?? null;
            $artigo->id_subcat = $input->id_subcat ?? null;

            $id = $artigo->criar();
            if ($id) {
                if (isset($input->id_lab)) {
                    $artigo->adicionarAoLab($id, $input->id_lab);
                }
                http_response_code(201);
                echo json_encode(["message" => "Artigo criado com sucesso", "id" => $id]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Erro ao criar artigo"]);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $artigo->id_artigo = $input['id_artigo'] ?? null;
            $artigo->nome_artigo = $input['nome_artigo'] ?? null;
            $artigo->num_serial = $input['num_serial'] ?? null;
            $artigo->id_subcat = $input['id_subcat'] ?? null;

            if ($artigo->atualizar()) {
                if (array_key_exists('id_lab', $input)) {
                    $artigo->setLab($artigo->id_artigo, $input['id_lab']);
                }
                if (array_key_exists('quantidade', $input)) {
                    $artigo->setQuantidadeIfExists($artigo->id_artigo, $input['quantidade']);
                }

                echo json_encode(["message" => "Artigo atualizado com sucesso"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Erro ao atualizar artigo"]);
            }
            break;

        case 'DELETE':
            if (isset($_GET['id'])) {
                if ($artigo->eliminar($_GET['id'])) {
                    echo json_encode(["message" => "Artigo eliminado com sucesso"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Erro ao eliminar artigo"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "ID nÃ£o fornecido"]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "MÃ©todo nÃ£o permitido"]);
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erro no servidor", "error" => $e->getMessage()]);
}
?>
