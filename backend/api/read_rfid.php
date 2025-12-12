<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function lerCartaoRFID($timeout = 30, $bridge_host = '127.0.0.1', $bridge_port = 9999) {
    try {
        $hosts_to_try = [$bridge_host];
        if ($bridge_host === 'host.docker.internal' || $bridge_host === '127.0.0.1') {
            $hosts_to_try = [
                '172.17.192.1',
                'host.docker.internal',
                '172.20.0.1',
                '172.17.0.1',
                '127.0.0.1',
                'localhost'
            ];
        }

        $last_error = '';
        foreach ($hosts_to_try as $host) {
            $url = "http://{$host}:{$bridge_port}/read?timeout={$timeout}";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, $timeout + 5);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curl_error = curl_error($ch);
            curl_close($ch);
            if ($response !== false && empty($curl_error)) {
                $bridge_host = $host;
                goto process_response;
            }

            $last_error = $curl_error;
        }
        return [
            'success' => false,
            'status' => 'error',
            'message' => "Erro ao conectar ao bridge: {$last_error}. Tentados: " . implode(', ', $hosts_to_try) . ":{$bridge_port}"
        ];

        process_response:
        if ($http_code === 204) {
            return [
                'success' => false,
                'status' => 'idle',
                'message' => 'Nenhum cartÃ£o lido dentro do timeout'
            ];
        }
        $data = json_decode($response, true);

        if ($data === null) {
            return [
                'success' => false,
                'status' => 'error',
                'message' => 'Resposta invÃ¡lida do bridge'
            ];
        }

        return $data;

    } catch (Exception $e) {
        return [
            'success' => false,
            'status' => 'error',
            'message' => "Erro ao ler cartÃ£o: " . $e->getMessage()
        ];
    }
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            $timeout = isset($_GET['timeout']) ? (int)$_GET['timeout'] : 30;
            $default_host = (getenv('DOCKER_ENV') === 'true' || file_exists('/.dockerenv')) ? 'host.docker.internal' : '127.0.0.1';
            $bridge_host = $_GET['bridge_host'] ?? $default_host;
            $bridge_port = isset($_GET['bridge_port']) ? (int)$_GET['bridge_port'] : 9999;
            if ($timeout < 1 || $timeout > 120) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Timeout deve estar entre 1 e 120 segundos'
                ]);
                exit;
            }
            $resultado = lerCartaoRFID($timeout, $bridge_host, $bridge_port);
            if ($resultado['success']) {
                http_response_code(200);
            } elseif ($resultado['status'] === 'idle') {
                http_response_code(204);
            } else {
                http_response_code(500);
            }

            echo json_encode($resultado);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['uid'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'UID nÃ£o fornecido'
                ]);
                exit;
            }
            require_once __DIR__ . '/../models/CartaoRFID.php';
            $cartaoRFID = new CartaoRFID();

            $id_artigo = $input['id_artigo'] ?? null;
            $resultado = $cartaoRFID->associar($input['uid'], $id_artigo);

            echo json_encode($resultado);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'MÃ©todo nÃ£o permitido'
            ]);
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Erro no servidor: ' . $e->getMessage()
    ]);
}
?>

