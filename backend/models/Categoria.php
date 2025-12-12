<?php
require_once __DIR__ . '/../config/database.php';

class Categoria {
    private $conn;
    private $table = 'categoria';

    public $id_cat;
    public $nome_cat;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }
    public function listarTodos() {
        $query = "SELECT id_cat, nome_cat FROM " . $this->table . " ORDER BY nome_cat";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function listarComSubcategorias() {
        $query = "SELECT 
                    c.id_cat,
                    c.nome_cat,
                    s.id_subcat,
                    s.nome_subcat
                  FROM " . $this->table . " c
                  LEFT JOIN subcategoria s ON c.id_cat = s.id_cat
                  ORDER BY c.nome_cat, s.nome_subcat";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $categorias = [];
        foreach ($results as $row) {
            $id_cat = $row['id_cat'];

            if (!isset($categorias[$id_cat])) {
                $categorias[$id_cat] = [
                    'id_cat' => $row['id_cat'],
                    'nome_cat' => $row['nome_cat'],
                    'subcategorias' => []
                ];
            }

            if ($row['id_subcat']) {
                $categorias[$id_cat]['subcategorias'][] = [
                    'id_subcat' => $row['id_subcat'],
                    'nome_subcat' => $row['nome_subcat']
                ];
            }
        }

        return array_values($categorias);
    }
    public function obterPorId($id) {
        $query = "SELECT id_cat, nome_cat FROM " . $this->table . " WHERE id_cat = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function criar() {
        $query = "INSERT INTO " . $this->table . " (nome_cat) VALUES (:nome_cat)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome_cat', $this->nome_cat);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }
    public function atualizar() {
        $query = "UPDATE " . $this->table . " SET nome_cat = :nome_cat WHERE id_cat = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome_cat', $this->nome_cat);
        $stmt->bindParam(':id', $this->id_cat);

        return $stmt->execute();
    }
    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id_cat = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);

        return $stmt->execute();
    }
    public function contarArtigos($id_cat) {
        $query = "SELECT COUNT(DISTINCT a.id_artigo) as total
                  FROM artigo a
                  INNER JOIN subcategoria s ON a.id_subcat = s.id_subcat
                  WHERE s.id_cat = :id_cat";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_cat', $id_cat);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'];
    }
    public function obterSubcategorias($id_cat) {
        $query = "SELECT id_subcat, nome_subcat 
                  FROM subcategoria 
                  WHERE id_cat = :id_cat
                  ORDER BY nome_subcat";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_cat', $id_cat);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
