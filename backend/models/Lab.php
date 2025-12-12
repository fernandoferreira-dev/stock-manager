<?php
require_once __DIR__ . '/../config/database.php';

class Lab {
    private $conn;
    private $table = 'lab';

    public $id_lab;
    public $num_lab;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }
    public function listarTodos() {
        $query = "SELECT id_lab, num_lab FROM " . $this->table . " ORDER BY num_lab";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function obterPorId($id) {
        $query = "SELECT id_lab, num_lab FROM " . $this->table . " WHERE id_lab = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function criar() {
        $query = "INSERT INTO " . $this->table . " (num_lab) VALUES (:num_lab)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':num_lab', $this->num_lab);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }
    public function atualizar() {
        $query = "UPDATE " . $this->table . " SET num_lab = :num_lab WHERE id_lab = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':num_lab', $this->num_lab);
        $stmt->bindParam(':id', $this->id_lab);

        return $stmt->execute();
    }
    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id_lab = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);

        return $stmt->execute();
    }
    public function contarArtigos($id_lab) {
        $query = "SELECT COUNT(*) as total FROM artigo_lab WHERE id_lab = :id_lab";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_lab', $id_lab);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'];
    }
    public function obterArtigos($id_lab) {
        $query = "SELECT a.* 
                  FROM artigo a
                  INNER JOIN artigo_lab al ON a.id_artigo = al.id_artigo
                  WHERE al.id_lab = :id_lab
                  ORDER BY a.nome_artigo";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_lab', $id_lab);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
