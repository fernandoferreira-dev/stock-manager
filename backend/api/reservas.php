<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../models/Reserva.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/email.php';
require __DIR__ . '/../vendor/autoload.php';

$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../storage/logs/error.log');
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function respond($success, $message, $extra = []) {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

try {

    $reserva = new Reserva();
    $conn = Database::getInstance()->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {

        case 'GET':
            if (isset($_GET['id']) && !empty($_GET['id'])) {
                $id_reserva = intval($_GET['id']);
                $reservaData = $reserva->obterPorId($id_reserva);

                if ($reservaData) {
                    respond(true, 'OK', $reservaData);
                } else {
                    respond(false, 'Reserva nÃ£o encontrada');
                }
            } else {
                $reservas = $reserva->listarTodos();
                respond(true, 'OK', ['data' => $reservas]);
            }
            break;

        case 'POST':

            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            if (isset($data['acao']) && isset($data['id_reserva'])) {
                switch ($data['acao']) {
                    case 'aprovar':
                        $success = $reserva->aprovar($data['id_reserva']);
                        respond($success, $success ? 'Reserva aprovada' : 'Erro ao aprovar reserva');
                        break;

                    case 'rejeitar':
                        $success = $reserva->rejeitar($data['id_reserva']);
                        respond($success, $success ? 'Reserva rejeitada' : 'Erro ao rejeitar reserva');
                        break;

                    case 'marcar_levantado':
                        $success = $reserva->marcarComoLevantado($data['id_reserva']);
                        respond($success, $success ? 'Marcado como levantado' : 'Erro ao marcar como levantado');
                        break;

                    case 'devolver':
                        $success = $reserva->devolver($data['id_reserva']);
                        respond($success, $success ? 'Material devolvido' : 'Erro ao devolver');
                        break;

                    default:
                        respond(false, 'AÃ§Ã£o desconhecida');
                }
            }
            if (empty($data['id_prof'])) {
                respond(false, 'ID do professor Ã© obrigatÃ³rio');
            }

            $id_prof_fk = null;
            $id_aluno_fk = null;
            $nomeProf = "N/A";
            $nomeAluno = "N/A";
            $idProf = $data['id_prof'];
            $stmtProf = $conn->prepare("
                SELECT prof.id_prof, pessoa.nome
                FROM prof
                INNER JOIN pessoa ON prof.id_pessoa = pessoa.id_pessoa
                WHERE prof.id_prof = :id_prof OR prof.id_pessoa = :id_pessoa
            ");
            $stmtProf->bindParam(':id_prof', $idProf);
            $stmtProf->bindParam(':id_pessoa', $idProf);
            $stmtProf->execute();
            $resultProf = $stmtProf->fetch(PDO::FETCH_ASSOC);

            if ($resultProf) {
                $id_prof_fk = $resultProf['id_prof'];
                $nomeProf = $resultProf['nome'];
            } else {
                respond(false, "Professor nÃ£o encontrado (id enviado: {$idProf})");
            }

            if (!empty($data['id_aluno'])) {
                $stmtAluno = $conn->prepare("
                    SELECT aluno.id_aluno, pessoa.nome
                    FROM aluno
                    INNER JOIN pessoa ON aluno.id_pessoa = pessoa.id_pessoa
                    WHERE aluno.id_aluno = :id_aluno OR aluno.id_pessoa = :id_pessoa
                ");
                $stmtAluno->bindParam(':id_aluno', $data['id_aluno']);
                $stmtAluno->bindParam(':id_pessoa', $data['id_aluno']);
                $stmtAluno->execute();
                $resultAluno = $stmtAluno->fetch(PDO::FETCH_ASSOC);

                if ($resultAluno) {
                    $id_aluno_fk = $resultAluno['id_aluno'];
                    $nomeAluno = $resultAluno['nome'];
                } else {
                    respond(false, "Aluno nÃ£o encontrado (id enviado: {$data['id_aluno']})");
                }
            }

            $reserva->id_prof = $id_prof_fk;
            $reserva->id_aluno = $id_aluno_fk;
            $reserva->motivo = $data['motivo'] ?? 'RequisiÃ§Ã£o de material';
            $reserva->data_reserva = $data['data_reserva'] ?? date('Y-m-d');
            $reserva->data_retorno = $data['data_retorno'] ?? null;
            $id_estado_raw = $data['id_estado'] ?? 1;
            if (is_numeric($id_estado_raw)) {
                $reserva->id_estado = (int)$id_estado_raw;
            } else {
                $estado_map = ['P' => 1, 'A' => 2, 'R' => 3, 'E' => 4, 'D' => 5];
                $reserva->id_estado = $estado_map[strtoupper($id_estado_raw)] ?? 1;
            }

            $artigos = is_array($data['artigos']) ? $data['artigos'] : [];
            $id_reserva = $reserva->criar($artigos);

            $emailStatus = 'Desabilitado';

            if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                try {
                    $mail = EmailConfig::getMailer();
                    $mail->addAddress('diogoeliasrocha@gmail.com'); 
                    $mail->Subject = 'Nova RequisiÃ§Ã£o de Material - Sistema Stock Manager';

                    $articulosHtml = '';
                    $articulosNomes = [];

                    foreach ($artigos as $idArtigo) {
                        $stmtArtigo = $conn->prepare("SELECT nome_artigo FROM artigo WHERE id_artigo = :id");
                        $stmtArtigo->bindParam(':id', $idArtigo);
                        $stmtArtigo->execute();
                        $resultArtigo = $stmtArtigo->fetch(PDO::FETCH_ASSOC);

                        if ($resultArtigo) {
                            $nomeArtigo = $resultArtigo['nome_artigo'];
                            $articulosHtml .= "<li>$nomeArtigo (ID: $idArtigo)</li>";
                            $articulosNomes[] = $nomeArtigo;
                        } else {
                            $articulosHtml .= "<li>ID Artigo: $idArtigo (nÃ£o encontrado)</li>";
                            $articulosNomes[] = "ID: $idArtigo";
                        }
                    }

                    $mail->Body = "
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                                .header { background-color: #1976d2; color: white; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
                                .field { margin: 10px 0; }
                                .label { font-weight: bold; color: #1976d2; }
                                .items { margin-left: 20px; margin-top: 10px; }
                                .footer { margin-top: 20px; font-size: 12px; color: #666; }
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <h2>ðŸ“¦ Nova RequisiÃ§Ã£o de Material</h2>
                                </div>
                                <div class='field'><span class='label'>Aluno:</span> $nomeAluno</div>
                                <div class='field'><span class='label'>Professor ResponsÃ¡vel:</span> $nomeProf</div>
                                <div class='field'><span class='label'>Motivo:</span> {$reserva->motivo}</div>
                                <div class='field'><span class='label'>Data da Reserva:</span> {$reserva->data_reserva}</div>
                                <div class='field'><span class='label'>Artigos:</span><ul class='items'>$articulosHtml</ul></div>
                                <div class='footer'>
                                    <p>Este Ã© um email automÃ¡tico. NÃ£o responda.</p>
                                    <p>ID da Reserva: #$id_reserva</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    ";

                    $mail->AltBody = "Aluno: $nomeAluno\nProfessor: $nomeProf\nMotivo: {$reserva->motivo}\nProdutos: " . implode(", ", $articulosNomes) . "\nData: {$reserva->data_reserva}";
                    $mail->send();
                    $emailStatus = 'Email enviado com sucesso';

                } catch (Exception $e) {
                    $errorMsg = "[" . date('Y-m-d H:i:s') . "] PHPMailer error: " . $e->getMessage() . "\n";
                    $errorMsg .= "Stack trace: " . $e->getTraceAsString() . "\n";
                    error_log($errorMsg);
                    file_put_contents(__DIR__ . '/../storage/logs/email_errors.log', $errorMsg, FILE_APPEND);
                    $emailStatus = 'Falha ao enviar email (ver logs)';
                }
            } else {
                $emailStatus = 'PHPMailer nÃ£o instalado';
            }

            respond(true, "Reserva criada com sucesso. $emailStatus", ['id_reserva' => $id_reserva]);

            break;

        case 'DELETE':
            $id_reserva = $_GET['id'] ?? null;
            if (empty($id_reserva)) respond(false, 'ID da reserva Ã© obrigatÃ³rio');

            $resultado = $reserva->eliminar($id_reserva);

            if ($resultado) {
                respond(true, "Reserva cancelada com sucesso");
            } else {
                respond(false, "Erro ao cancelar reserva");
            }
            break;

        default:
            http_response_code(405);
            respond(false, 'MÃ©todo nÃ£o permitido');
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log("Server error: " . $e->getMessage());
    respond(false, 'Erro no servidor. Verifique os logs.');
}

