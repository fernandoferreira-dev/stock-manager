<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../models/Categoria.php';

$categoria = new Categoria();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $data = $categoria->obterPorId($_GET['id']);
                echo json_encode($data ?: ["message" => "Categoria nÃ£o encontrada"]);
            } elseif (isset($_GET['subcategorias'])) {
                $data = $categoria->obterSubcategorias($_GET['subcategorias']);
                echo json_encode($data);
            } elseif (isset($_GET['com_subcategorias']) && $_GET['com_subcategorias'] == 'true') {
                $data = $categoria->listarComSubcategorias();
                echo json_encode($data);
            } else {
                $data = $categoria->listarTodos();
                echo json_encode($data);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'));

            if (!isset($input->nome_cat)) {
                http_response_code(400);
                echo json_encode(["message" => "Nome da categoria Ã© obrigatÃ³rio"]);
                break;
            }

            $categoria->nome_cat = $input->nome_cat;

            $id = $categoria->criar();
            if ($id) {
                http_response_code(201);
                echo json_encode([
                    "message" => "Categoria criada com sucesso",
                    "id" => $id
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Erro ao criar categoria"]);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'));

            if (!isset($input->id_cat) || !isset($input->nome_cat)) {
                http_response_code(400);
                echo json_encode(["message" => "Dados incompletos"]);
                break;
            }

            $categoria->id_cat = $input->id_cat;
            $categoria->nome_cat = $input->nome_cat;

            if ($categoria->atualizar()) {
                echo json_encode(["message" => "Categoria atualizada com sucesso"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Erro ao atualizar categoria"]);
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(["message" => "ID nÃ£o fornecido"]);
                break;
            }
            $totalArtigos = $categoria->contarArtigos($_GET['id']);
            if ($totalArtigos > 0) {
                http_response_code(400);
                echo json_encode([
                    "message" => "NÃ£o Ã© possÃ­vel eliminar. Categoria tem {$totalArtigos} artigo(s) associado(s)"
                ]);
                break;
            }

            if ($categoria->eliminar($_GET['id'])) {
                echo json_encode(["message" => "Categoria eliminada com sucesso"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Erro ao eliminar categoria"]);
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
