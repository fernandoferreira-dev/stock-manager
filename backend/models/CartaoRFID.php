<?php

require_once __DIR__ . '/../config/database.php';

class CartaoRFID {
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    public function listarTodos() {
        try {
            $query = "SELECT c.*, a.nome_artigo 
                     FROM cartao_nfc c 
                     LEFT JOIN artigo a ON c.id_artigo = a.id_artigo 
                     ORDER BY c.data_associacao DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Erro ao listar cartÃµes: " . $e->getMessage());
            return [];
        }
    }

    public function obterPorUID($uid) {
        try {
            $query = "SELECT c.*, a.nome_artigo 
                     FROM cartao_nfc c 
                     LEFT JOIN artigo a ON c.id_artigo = a.id_artigo 
                     WHERE c.uid_nfc = :uid";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $uid);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Erro ao obter cartÃ£o: " . $e->getMessage());
            return null;
        }
    }

    public function listarPorArtigo($id_artigo) {
        try {
            $query = "SELECT * FROM cartao_nfc WHERE id_artigo = :id_artigo ORDER BY data_associacao DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_artigo', $id_artigo);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Erro ao listar cartÃµes do artigo: " . $e->getMessage());
            return [];
        }
    }

    public function registrar($uid, $id_artigo = null, $ativo = 1) {
        try {
            $existe = $this->obterPorUID($uid);
            if ($existe) {
                return [
                    'success' => false,
                    'message' => 'CartÃ£o jÃ¡ registrado',
                    'cartao' => $existe
                ];
            }

            $query = "INSERT INTO cartao_nfc (uid_nfc, id_artigo, ativo) 
                     VALUES (:uid, :id_artigo, :ativo)";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $uid);
            $stmt->bindParam(':id_artigo', $id_artigo);
            $stmt->bindParam(':ativo', $ativo, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return [
                    'success' => true,
                    'message' => 'CartÃ£o registrado com sucesso',
                    'id' => $this->conn->lastInsertId()
                ];
            }

            return ['success' => false, 'message' => 'Erro ao registrar cartÃ£o'];

        } catch(PDOException $e) {
            error_log("Erro ao registrar cartÃ£o: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()];
        }
    }

    public function associar($uid, $id_artigo) {
        try {
            $cartao = $this->obterPorUID($uid);

            if (!$cartao) {
                $resultado = $this->registrar($uid, $id_artigo, 1);
                return $resultado;
            }
            $query = "UPDATE cartao_nfc 
                     SET id_artigo = :id_artigo, 
                         ativo = 1,
                         data_associacao = NOW()
                     WHERE uid_nfc = :uid";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $uid);
            $stmt->bindParam(':id_artigo', $id_artigo);

            if ($stmt->execute()) {
                return [
                    'success' => true,
                    'message' => 'CartÃ£o associado com sucesso',
                    'cartao' => $this->obterPorUID($uid)
                ];
            }

            return ['success' => false, 'message' => 'Erro ao associar cartÃ£o'];

        } catch(PDOException $e) {
            error_log("Erro ao associar cartÃ£o: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()];
        }
    }

    public function desassociar($uid) {
        try {
            $query = "UPDATE cartao_nfc 
                     SET id_artigo = NULL, 
                         ativo = 0
                     WHERE uid_nfc = :uid";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $uid);

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'CartÃ£o desassociado com sucesso'];
            }

            return ['success' => false, 'message' => 'Erro ao desassociar cartÃ£o'];

        } catch(PDOException $e) {
            error_log("Erro ao desassociar cartÃ£o: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()];
        }
    }

    public function atualizarStatus($uid, $ativo) {
        try {
            $query = "UPDATE cartao_nfc 
                     SET ativo = :ativo
                     WHERE uid_nfc = :uid";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $uid);
            $stmt->bindParam(':ativo', $ativo, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Status atualizado com sucesso'];
            }

            return ['success' => false, 'message' => 'Erro ao atualizar status'];

        } catch(PDOException $e) {
            error_log("Erro ao atualizar status: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()];
        }
    }

    public function eliminar($uid) {
        try {
            $query = "DELETE FROM cartao_nfc WHERE uid_nfc = :uid";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $uid);

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'CartÃ£o eliminado com sucesso'];
            }

            return ['success' => false, 'message' => 'Erro ao eliminar cartÃ£o'];

        } catch(PDOException $e) {
            error_log("Erro ao eliminar cartÃ£o: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()];
        }
    }

    public function registrarUso($uid) {
        return true;
    }

    public function obterEstatisticas() {
        try {
            $query = "SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as ativos,
                        SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) as inativos,
                        SUM(CASE WHEN id_artigo IS NULL THEN 1 ELSE 0 END) as disponiveis,
                        SUM(CASE WHEN id_artigo IS NOT NULL THEN 1 ELSE 0 END) as associados
                     FROM cartao_nfc";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Erro ao obter estatÃ­sticas: " . $e->getMessage());
            return null;
        }
    }
}
?>

