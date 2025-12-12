<?php

require_once __DIR__ . '/../models/CartaoRFID.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function respond($success, $message, $data = null) {
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($data !== null && $success ? $data : $response);
    exit;
}

try {
    $conn = Database::getInstance()->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            $id_artigo = isset($_GET['id_artigo']) ? intval($_GET['id_artigo']) : null;
            $ativos = isset($_GET['ativos']) && $_GET['ativos'] === 'true';

            $query = "SELECT id_cartao_nfc, uid_nfc, ativo, id_artigo, data_associacao 
                      FROM cartao_nfc 
                      WHERE 1=1";

            if ($id_artigo) {
                $query .= " AND id_artigo = :id_artigo";
            }

            if ($ativos) {
                $query .= " AND ativo = 1";
            }

            $query .= " ORDER BY codigo_uid";

            $stmt = $conn->prepare($query);

            if ($id_artigo) {
                $stmt->bindParam(':id_artigo', $id_artigo, PDO::PARAM_INT);
            }

            $stmt->execute();
            $cartoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            respond(true, 'OK', $cartoes);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['action'])) {
                respond(false, 'AÃ§Ã£o nÃ£o especificada');
            }

            if ($data['action'] === 'replace_nfc') {
                $replacements = $data['replacements'] ?? [];
                $id_reserva = $data['id_reserva'] ?? null;

                if (empty($replacements) || !$id_reserva) {
                    respond(false, 'Dados de substituiÃ§Ã£o invÃ¡lidos');
                }

                $conn->beginTransaction();

                try {
                    foreach ($replacements as $id_artigo => $novo_id_cartao) {
                        $stmtAtual = $conn->prepare(
                            "SELECT id_cartao_nfc FROM cartao_nfc 
                             WHERE id_artigo = :id_artigo 
                             LIMIT 1"
                        );
                        $stmtAtual->execute([
                            ':id_artigo' => $id_artigo
                        ]);
                        $cartaoAtual = $stmtAtual->fetch(PDO::FETCH_ASSOC);

                        if (!$cartaoAtual) {
                            throw new Exception("CartÃ£o atual nÃ£o encontrado para artigo $id_artigo");
                        }
                        $stmtLiberar = $conn->prepare(
                            "UPDATE cartao_nfc 
                             SET id_artigo = NULL, ativo = 0 
                             WHERE id_cartao_nfc = :id_cartao"
                        );
                        $stmtLiberar->execute([':id_cartao' => $cartaoAtual['id_cartao_nfc']]);
                        $stmtAssociar = $conn->prepare(
                            "UPDATE cartao_nfc 
                             SET id_artigo = :id_artigo, ativo = 1
                             WHERE id_cartao_nfc = :novo_id_cartao"
                        );
                        $result = $stmtAssociar->execute([
                            ':id_artigo' => $id_artigo,
                            ':novo_id_cartao' => $novo_id_cartao
                        ]);

                        if ($stmtAssociar->rowCount() === 0) {
                            throw new Exception("Novo cartÃ£o nÃ£o existe ou nÃ£o foi atualizado");
                        }
                    }

                    $conn->commit();
                    respond(true, 'CartÃµes substituÃ­dos com sucesso');

                } catch (Exception $e) {
                    $conn->rollBack();
                    respond(false, 'Erro ao substituir cartÃµes: ' . $e->getMessage());
                }
            } else {
                respond(false, 'AÃ§Ã£o desconhecida');
            }
            break;

        default:
            respond(false, 'MÃ©todo nÃ£o suportado');
    }

} catch (Exception $e) {
    error_log("Erro em nfc_cards.php: " . $e->getMessage());
    respond(false, 'Erro no servidor: ' . $e->getMessage());
}

