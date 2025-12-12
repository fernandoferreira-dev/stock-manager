<?php
require_once __DIR__ . '/../config/database.php';

class Reserva {
    private $conn;
    private $table = 'reserva';

    public $id_reserva;
    public $id_prof;
    public $id_aluno;
    public $motivo;
    public $data_reserva;
    public $data_retorno;
    public $id_estado;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    public function criar($artigos = []) {
        try {
            $this->conn->beginTransaction();

            $query = "INSERT INTO " . $this->table . " 
                      (id_prof, id_aluno, motivo, data_reserva, data_retorno, id_estado) 
                      VALUES (:id_prof, :id_aluno, :motivo, :data_reserva, :data_retorno, :id_estado)";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_prof', $this->id_prof);
            $stmt->bindParam(':id_aluno', $this->id_aluno);
            $stmt->bindParam(':motivo', $this->motivo);
            $stmt->bindParam(':data_reserva', $this->data_reserva);
            $stmt->bindParam(':data_retorno', $this->data_retorno);
            $stmt->bindParam(':id_estado', $this->id_estado);

            $stmt->execute();
            $id_reserva = $this->conn->lastInsertId();

            if (!empty($artigos)) {
                $queryArtigo = "INSERT INTO artigo_reserva (id_reserva, id_artigo) 
                               VALUES (:id_reserva, :id_artigo)";
                $stmtArtigo = $this->conn->prepare($queryArtigo);

                foreach ($artigos as $id_artigo) {
                    $stmtArtigo->bindParam(':id_reserva', $id_reserva);
                    $stmtArtigo->bindParam(':id_artigo', $id_artigo);
                    $stmtArtigo->execute();
                }
            }

            $this->conn->commit();
            return $id_reserva;

        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function adicionarArtigo($id_reserva, $id_artigo) {
        $query = "INSERT INTO artigo_reserva (id_reserva, id_artigo) 
                  VALUES (:id_reserva, :id_artigo)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_reserva', $id_reserva);
        $stmt->bindParam(':id_artigo', $id_artigo);

        return $stmt->execute();
    }

    public function listarTodos() {
        $query = "SELECT 
                    r.id_reserva,
                    r.id_aluno,
                    r.id_prof,
                    r.id_estado,
                    r.data_reserva,
                    r.data_entrega as data_entrega_reserva,
                    r.motivo as motivo_reserva,
                    pe_aluno.nome_pessoa as nome_aluno,
                    a.email_aluno as email_aluno,
                    pe_prof.nome_pessoa as nome_prof,
                    p.email_prof as email_prof,
                    e.descricao as nome_estado
                  FROM " . $this->table . " r
                  LEFT JOIN prof p ON r.id_prof = p.id_prof
                  LEFT JOIN pessoa pe_prof ON p.id_pessoa = pe_prof.id_pessoa
                  LEFT JOIN aluno a ON r.id_aluno = a.id_aluno
                  LEFT JOIN pessoa pe_aluno ON a.id_pessoa = pe_aluno.id_pessoa
                  LEFT JOIN estado e ON r.id_estado = e.id_estado
                  ORDER BY r.data_reserva DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($reservas as &$reserva) {
            $reserva['artigos'] = $this->obterArtigosReserva($reserva['id_reserva']);
        }

        return $reservas;
    }

    public function listarPorAluno($id_aluno) {
        $query = "SELECT 
                    r.*,
                    e.descricao as nome_estado
                  FROM " . $this->table . " r
                  LEFT JOIN estado e ON r.id_estado = e.id_estado
                  WHERE r.id_aluno = :id_aluno
                  ORDER BY r.data_reserva DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_aluno', $id_aluno);
        $stmt->execute();
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($reservas as &$reserva) {
            $reserva['artigos'] = $this->obterArtigosReserva($reserva['id_reserva']);
        }

        return $reservas;
    }

    public function listarPorProfessor($id_prof) {
        $query = "SELECT 
                    r.*,
                    e.descricao as nome_estado
                  FROM " . $this->table . " r
                  LEFT JOIN estado e ON r.id_estado = e.id_estado
                  WHERE r.id_prof = :id_prof
                  ORDER BY r.data_reserva DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_prof', $id_prof);
        $stmt->execute();
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($reservas as &$reserva) {
            $reserva['artigos'] = $this->obterArtigosReserva($reserva['id_reserva']);
        }

        return $reservas;
    }

    public function listarPorEstado($id_estado) {
        $query = "SELECT 
                    r.*,
                    COALESCE(pe_prof.nome_pessoa, pe_aluno.nome_pessoa) as nome_utilizador,
                    COALESCE(p.email_prof, a.email_aluno) as email_utilizador,
                    e.descricao as nome_estado
                  FROM " . $this->table . " r
                  LEFT JOIN prof p ON r.id_prof = p.id_prof
                  LEFT JOIN pessoa pe_prof ON p.id_pessoa = pe_prof.id_pessoa
                  LEFT JOIN aluno a ON r.id_aluno = a.id_aluno
                  LEFT JOIN pessoa pe_aluno ON a.id_pessoa = pe_aluno.id_pessoa
                  LEFT JOIN estado e ON r.id_estado = e.id_estado
                  WHERE r.id_estado = :id_estado
                  ORDER BY r.data_reserva DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_estado', $id_estado);
        $stmt->execute();
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($reservas as &$reserva) {
            $reserva['artigos'] = $this->obterArtigosReserva($reserva['id_reserva']);
        }

        return $reservas;
    }

    public function obterPorId($id) {
        $query = "SELECT 
                    r.*,
                    COALESCE(pe_prof.nome_pessoa, pe_aluno.nome_pessoa) as nome_utilizador,
                    COALESCE(p.email_prof, a.email_aluno) as email_utilizador,
                    e.descricao as nome_estado
                  FROM " . $this->table . " r
                  LEFT JOIN prof p ON r.id_prof = p.id_prof
                  LEFT JOIN pessoa pe_prof ON p.id_pessoa = pe_prof.id_pessoa
                  LEFT JOIN aluno a ON r.id_aluno = a.id_aluno
                  LEFT JOIN pessoa pe_aluno ON a.id_pessoa = pe_aluno.id_pessoa
                  LEFT JOIN estado e ON r.id_estado = e.id_estado
                  WHERE r.id_reserva = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($reserva) {
            $reserva['artigos'] = $this->obterArtigosReserva($id);
        }

        return $reserva;
    }
    public function obterArtigosReserva($id_reserva) {
        $query = "SELECT 
                    a.id_artigo,
                    a.nome_artigo,
                    a.num_serial,
                    s.nome_subcat,
                    c.nome_cat as categoria,
                    cn.uid_nfc as uid_nfc,
                    cn.ativo as ativo_nfc
                  FROM artigo_reserva ar
                  JOIN artigo a ON ar.id_artigo = a.id_artigo
                  LEFT JOIN subcategoria s ON a.id_subcat = s.id_subcat
                  LEFT JOIN categoria c ON s.id_cat = c.id_cat
                  LEFT JOIN cartao_nfc cn ON cn.id_artigo = a.id_artigo 
                  WHERE ar.id_reserva = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id_reserva]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function atualizarEstado($id_reserva, $id_estado) {
        $query = "UPDATE " . $this->table . " 
                  SET id_estado = :id_estado 
                  WHERE id_reserva = :id_reserva";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_estado', $id_estado);
        $stmt->bindParam(':id_reserva', $id_reserva);

        return $stmt->execute();
    }
    public function aprovar($id_reserva) {
        try {
            if (!$this->atualizarEstado($id_reserva, 2)) {
                return false;
            }
            $this->atribuirCartoesNFC($id_reserva);

            return true;
        } catch (Exception $e) {
            error_log("Erro ao aprovar reserva: " . $e->getMessage());
            return false;
        }
    }
    private function atribuirCartoesNFC($id_reserva) {
        $query = "SELECT id_artigo FROM artigo_reserva WHERE id_reserva = :id_reserva";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_reserva', $id_reserva);
        $stmt->execute();
        $artigos = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $queryCartao = "SELECT id_cartao_nfc 
                        FROM cartao_nfc 
                        WHERE id_artigo = :id_artigo 
                        AND estado = 'disponivel' 
                        AND id_reserva IS NULL 
                        ORDER BY RAND() 
                        LIMIT 1";
        $stmtCartao = $this->conn->prepare($queryCartao);

        $queryAtualizar = "UPDATE cartao_nfc 
                           SET id_reserva = :id_reserva, 
                               estado = 'reservado' 
                           WHERE id_cartao_nfc = :id_cartao_nfc";
        $stmtAtualizar = $this->conn->prepare($queryAtualizar);

        foreach ($artigos as $id_artigo) {
            $stmtCartao->bindParam(':id_artigo', $id_artigo);
            $stmtCartao->execute();
            $cartao = $stmtCartao->fetch(PDO::FETCH_COLUMN);

            if ($cartao) {
                $stmtAtualizar->bindParam(':id_reserva', $id_reserva);
                $stmtAtualizar->bindParam(':id_cartao_nfc', $cartao);
                $stmtAtualizar->execute();
            }
        }
    }
    public function rejeitar($id_reserva) {
        return $this->atualizarEstado($id_reserva, 3);
    }
    public function marcarParaLevantar($id_reserva) {
        return $this->atualizarEstado($id_reserva, 'L');
    }
    public function marcarComoLevantado($id_reserva) {
        return $this->atualizarEstado($id_reserva, 4);
    }
    public function devolver($id_reserva) {
        try {
            $this->conn->beginTransaction();
            $queryHistorico = "INSERT INTO cartao_nfc_historico 
                               (id_cartao_nfc, id_reserva, codigo_uid, data_inicio, data_fim)
                               SELECT id_cartao_nfc, id_reserva, codigo_uid, data_inicio, CURDATE()
                               FROM cartao_nfc 
                               WHERE id_reserva = :id_reserva";
            $stmtHistorico = $this->conn->prepare($queryHistorico);
            $stmtHistorico->bindParam(':id_reserva', $id_reserva);
            $stmtHistorico->execute();
            $query = "UPDATE cartao_nfc 
                      SET estado = 'disponivel', 
                          id_reserva = NULL,
                          data_fim = CURDATE()
                      WHERE id_reserva = :id_reserva";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_reserva', $id_reserva);
            $stmt->execute();
            if (!$this->atualizarEstado($id_reserva, 5)) {
                $this->conn->rollBack();
                return false;
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Erro ao devolver reserva: " . $e->getMessage());
            return false;
        }
    }
    public function eliminar($id) {
        try {
            $this->conn->beginTransaction();
            $queryArtigos = "DELETE FROM artigo_reserva WHERE id_reserva = :id";
            $stmtArtigos = $this->conn->prepare($queryArtigos);
            $stmtArtigos->bindParam(':id', $id);
            $stmtArtigos->execute();
            $query = "DELETE FROM " . $this->table . " WHERE id_reserva = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }
}
?>
