<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../models/Reserva.php';
require_once __DIR__ . '/../middleware/auth.php';
$authData = verificarToken();
if (!$authData) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token invÃ¡lido ou expirado']);
    exit;
}

$reserva = new Reserva();
$metodo = $_SERVER['REQUEST_METHOD'];

try {
    switch ($metodo) {
        case 'GET':
            if (isset($_GET['id'])) {
                $resultado = $reserva->obterPorId($_GET['id']);

                if ($resultado) {
                    $isOwner = ($resultado['id_prof'] == $authData['id']) || 
                              ($resultado['id_aluno'] == $authData['id']);
                    $isAdmin = $authData['role'] === 'administrador';

                    if ($isOwner || $isAdmin) {
                        echo json_encode(['success' => true, 'reserva' => $resultado]);
                    } else {
                        http_response_code(403);
                        echo json_encode(['success' => false, 'message' => 'Sem permissÃ£o']);
                    }
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Reserva nÃ£o encontrada']);
                }
            } else {
                if ($authData['role'] === 'administrador') {
                    $reservas = $reserva->listarTodas();
                } else {
                    $reservas = $reserva->listarPorUtilizador($authData['id']);
                }

                echo json_encode(['success' => true, 'reservas' => $reservas]);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!isset($input['motivo']) || !isset($input['data_entrega']) || !isset($input['artigos'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
                exit;
            }

            if (empty($input['artigos'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nenhum artigo selecionado']);
                exit;
            }
            $dataEntrega = new DateTime($input['data_entrega']);
            $hoje = new DateTime();
            if ($dataEntrega <= $hoje) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Data de entrega deve ser futura']);
                exit;
            }
            $reserva->motivo = trim($input['motivo']);
            $reserva->data_reserva = date('Y-m-d');
            $reserva->data_entrega = $input['data_entrega'];
            $reserva->id_estado = 1;
            if ($authData['role'] === 'professor') {
                $reserva->id_prof = $authData['id'];
                $reserva->id_aluno = null;
            } else {
                $reserva->id_prof = null;
                $reserva->id_aluno = $authData['id'];
            }
            $id_reserva = $reserva->criar($input['artigos']);

            if ($id_reserva) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Reserva criada com sucesso',
                    'id_reserva' => $id_reserva
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro ao criar reserva']);
            }
            break;

        case 'PUT':
            if ($authData['role'] !== 'administrador') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Apenas administradores podem atualizar']);
                exit;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['id_reserva']) || !isset($input['id_estado'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
                exit;
            }

            if ($reserva->atualizarEstado($input['id_reserva'], $input['id_estado'])) {
                echo json_encode(['success' => true, 'message' => 'Estado atualizado com sucesso']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar estado']);
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID da reserva nÃ£o fornecido']);
                exit;
            }

            $id_reserva = $_GET['id'];

            if ($authData['role'] === 'administrador') {
                if ($reserva->eliminar($id_reserva)) {
                    echo json_encode(['success' => true, 'message' => 'Reserva eliminada com sucesso']);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Erro ao eliminar reserva']);
                }
            } else {
                if ($reserva->cancelar($id_reserva, $authData['id'])) {
                    echo json_encode(['success' => true, 'message' => 'Reserva cancelada com sucesso']);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'NÃ£o Ã© possÃ­vel cancelar esta reserva']);
                }
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'MÃ©todo nÃ£o permitido']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Erro no servidor: ' . $e->getMessage()
    ]);
}
?>
