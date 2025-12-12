<?php
require_once __DIR__ . '/../config/database.php';

class Subcategoria {
    private $conn;
    private $table = 'subcategoria';

    public $id_subcat;
    public $nome_subcat;
    public $id_cat;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }
    public function listarTodos() {
        $query = "SELECT 
                    s.id_subcat,
                    s.nome_subcat,
                    s.id_cat,
                    c.nome_cat
                  FROM " . $this->table . " s
                  LEFT JOIN categoria c ON s.id_cat = c.id_cat
                  ORDER BY c.nome_cat, s.nome_subcat";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function listarPorCategoria($id_cat) {
        $query = "SELECT id_subcat, nome_subcat, id_cat
                  FROM " . $this->table . "
                  WHERE id_cat = :id_cat
                  ORDER BY nome_subcat";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_cat', $id_cat);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function obterPorId($id) {
        $query = "SELECT 
                    s.id_subcat,
                    s.nome_subcat,
                    s.id_cat,
                    c.nome_cat
                  FROM " . $this->table . " s
                  LEFT JOIN categoria c ON s.id_cat = c.id_cat
                  WHERE s.id_subcat = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function criar() {
        $query = "INSERT INTO " . $this->table . " (nome_subcat, id_cat) 
                  VALUES (:nome_subcat, :id_cat)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome_subcat', $this->nome_subcat);
        $stmt->bindParam(':id_cat', $this->id_cat);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }
    public function atualizar() {
        $query = "UPDATE " . $this->table . " 
                  SET nome_subcat = :nome_subcat, id_cat = :id_cat 
                  WHERE id_subcat = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome_subcat', $this->nome_subcat);
        $stmt->bindParam(':id_cat', $this->id_cat);
        $stmt->bindParam(':id', $this->id_subcat);

        return $stmt->execute();
    }
    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id_subcat = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);

        return $stmt->execute();
    }
}
?>

