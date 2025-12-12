<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = Database::getInstance();
    $db = $database->getConnection();
    $query = "SELECT 
                h.id_historico,
                h.id_cartao_nfc,
                c.uid_nfc,
                a.nome_artigo,
                h.data_levantamento,
                h.data_devolucao,
                al.email_aluno as email_utilizador,
                p_aluno.nome_pessoa as nome_utilizador,
                p_prof.nome_pessoa as nome_professor,
                pr.email_prof as email_professor,
                h.observacoes
              FROM cartao_nfc_historico h
              LEFT JOIN cartao_nfc c ON h.id_cartao_nfc = c.id_cartao_nfc
              LEFT JOIN artigo a ON c.id_artigo = a.id_artigo
              LEFT JOIN aluno al ON h.id_aluno = al.id_aluno
              LEFT JOIN pessoa p_aluno ON al.id_pessoa = p_aluno.id_pessoa
              LEFT JOIN reserva r ON h.id_reserva = r.id_reserva
              LEFT JOIN prof pr ON r.id_prof = pr.id_prof
              LEFT JOIN pessoa p_prof ON pr.id_pessoa = p_prof.id_pessoa
              WHERE h.data_devolucao IS NOT NULL
              ORDER BY h.data_devolucao DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $historico = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($historico);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Erro no servidor",
        "error" => $e->getMessage()
    ]);
}
?>

